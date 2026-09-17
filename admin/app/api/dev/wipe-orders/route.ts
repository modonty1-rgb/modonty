import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * إخلاء الطلبات والفواتير وتوابعها — قاعدةُ الاختبار وحدها.
 *
 * يُستعمل في حلقة تجربة الترحيل: مزامنةٌ من الإنتاج ← إخلاءٌ بهذا ← تشغيلُ الترحيل ←
 * فحص ← أعِد من الصفر. وبلا إخلاءٍ نظيف تختلط طلباتُ التجربة السابقة بنتيجةِ الجديدة،
 * فلا يُعرف أيُّها صنعه الترحيل.
 *
 * الحارسُ الوحيد الذي يحمي شيئاً هو فحصُ `DATABASE_URL` تحت: هذا المسار لا يكتب إلا في
 * `modonty_dev`، والأدمن المنشور يشير إلى `modonty`، فيُرفض هناك مهما ناداه.
 *
 * ولا يمسّ: العملاء · المحتمَلين · الموظّفين · المقالات. هي مصدرُ الترحيل لا ناتجُه.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** الطلبُ وما تفرّع عنه. الترتيب يتبع الاعتماد: التابعُ قبل المتبوع. */
const STEPS = [
  { name: "payment_webhook_events", run: () => db.paymentWebhookEvent.deleteMany({}) },
  { name: "payment_attempts", run: () => db.paymentAttempt.deleteMany({}) },
  { name: "payment_transactions", run: () => db.paymentTransaction.deleteMany({}) },
  { name: "invoices", run: () => db.invoice.deleteMany({}) },
  { name: "checkout_orders", run: () => db.checkoutOrder.deleteMany({}) },
] as const;

/**
 * مجموعتان بأسماء الموديلات لا بأسماء الخرائط — بقايا تسميةٍ قديمة، خارج السكيما
 * فلا يراها Prisma. ظهرتا في مزامنة ١٧ سبتمبر بثمانيةِ صفوفٍ وصفّين، ولو تُركتا
 * لبقي في القاعدة دفعٌ قديمٌ لا ينظّفه شيء.
 */
const LEGACY_COLLECTIONS = ["PaymentAttempt", "WebhookEvent"] as const;

/** لا يُمسّ — مصدرُ الترحيل. يُعرَض في نافذة التأكيد حتى يُقرأ قبل الضغط. */
const KEPT = [
  { name: "clients", count: () => db.client.count() },
  { name: "sales_leads", count: () => db.salesLead.count() },
  { name: "staff", count: () => db.staff.count() },
  { name: "articles", count: () => db.article.count() },
] as const;

function refuseIfNotDev(): Response | null {
  const url = process.env.DATABASE_URL;
  if (!url) return Response.json({ error: "DATABASE_URL is not set" }, { status: 500 });
  if (!url.includes("modonty_dev")) {
    const dbName = url.match(/\/(\w+)\?/)?.[1] || "unknown";
    return Response.json(
      { error: `Refusing — DATABASE_URL must point to modonty_dev (current: ${dbName})` },
      { status: 400 },
    );
  }
  return null;
}

/** جردٌ للقراءة: ما سيُمسح وما سيبقى، قبل أي كتابة. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const refused = refuseIfNotDev();
  if (refused) return refused;

  const [orders, invoices, transactions, attempts, webhooks] = await Promise.all([
    db.checkoutOrder.count(),
    db.invoice.count(),
    db.paymentTransaction.count(),
    db.paymentAttempt.count(),
    db.paymentWebhookEvent.count(),
  ]);

  const legacy: Record<string, number> = {};
  for (const name of LEGACY_COLLECTIONS) {
    try {
      const res = (await db.$runCommandRaw({ count: name })) as { n?: number };
      legacy[name] = res?.n ?? 0;
    } catch {
      legacy[name] = 0; // المجموعة غير موجودة — لا شيء يُمسح
    }
  }

  const kept: Record<string, number> = {};
  for (const k of KEPT) kept[k.name] = await k.count();

  return Response.json({
    willDelete: {
      checkout_orders: orders,
      invoices,
      payment_transactions: transactions,
      payment_attempts: attempts,
      payment_webhook_events: webhooks,
      ...legacy,
    },
    kept,
  });
}

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const refused = refuseIfNotDev();
  if (refused) return refused;

  const startedAt = Date.now();

  /**
   * سجلُّ الفواتير قبل محوها.
   *
   * المستندُ الماليّ لا يُمحى بلا أثر ولو على قاعدة الاختبار: من بيانات الإنتاج ظهر أنّ
   * نفس اسم الباقة يحمل مبالغَ متباعدة (الانطلاقة ١٢٠٠ و٣٩٩٩، الزخم ٣٥٩٧ و٩٥٩٧)، وهذه
   * حقيقةٌ يبنى عليها الترحيل — فتُرجَع في الرد وتُقرأ قبل أن تضيع.
   */
  const invoiceLog = await db.invoice.findMany({
    select: {
      number: true,
      paymentStatus: true,
      currency: true,
      amount: true,
      tierName: true,
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const deleted: Record<string, number> = {};
  const failed: { name: string; error: string }[] = [];

  for (const step of STEPS) {
    try {
      const res = await step.run();
      deleted[step.name] = res.count;
    } catch (error) {
      failed.push({ name: step.name, error: error instanceof Error ? error.message : String(error) });
    }
  }

  for (const name of LEGACY_COLLECTIONS) {
    try {
      const res = (await db.$runCommandRaw({
        delete: name,
        deletes: [{ q: {}, limit: 0 }],
      })) as { n?: number };
      deleted[name] = res?.n ?? 0;
    } catch {
      deleted[name] = 0; // المجموعة غير موجودة أصلاً
    }
  }

  // تحقّقٌ بعديّ: العدُّ المُعاد هو الدليل، لا عددُ ما ادّعى الحذفُ أنّه حذفه.
  const [orders, invoices, transactions, attempts, webhooks] = await Promise.all([
    db.checkoutOrder.count(),
    db.invoice.count(),
    db.paymentTransaction.count(),
    db.paymentAttempt.count(),
    db.paymentWebhookEvent.count(),
  ]);
  const remaining = {
    checkout_orders: orders,
    invoices,
    payment_transactions: transactions,
    payment_attempts: attempts,
    payment_webhook_events: webhooks,
  };

  const kept: Record<string, number> = {};
  for (const k of KEPT) kept[k.name] = await k.count();

  const clean = Object.values(remaining).every((n) => n === 0) && failed.length === 0;

  return Response.json({
    clean,
    deleted,
    remaining,
    kept,
    failed,
    invoiceLog,
    durationMs: Date.now() - startedAt,
  });
}
