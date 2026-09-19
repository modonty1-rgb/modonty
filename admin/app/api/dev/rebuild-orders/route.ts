import { NextRequest } from "next/server";
import { checkOrdersMigrationGate } from "@/lib/orders-migration-gate";
import { addMonthsTo, marketForCountry, monthsForCycle, planAll, type PlannedOrder } from "./plan";
import { db } from "@/lib/db";
import { nextOrderNumber } from "@modonty/shared/lib/payments/next-order-number";

/**
 * إعادةُ بناء الطلبات — إخلاءٌ ثمّ ترحيل، في عمليّةٍ واحدة.
 *
 * العملاءُ القدامى وُلدوا قبل أن يوجد نظامُ الطلبات، فباقتُهم ومبلغُهم متفرّقان على
 * حقولٍ في كرت العميل وجدولٍ قديم. وكلُّ ما بُني في هذا الريفاكتور يقرأ من **الطلب**:
 * اسمُ الباقة · الحصّة · المبلغ · المدّة. فبلا طلبٍ لكلّ عميل يبقى الجدولُ القديم حيّاً.
 *
 * وخطوتان في زرٍّ واحد بقرار خالد (١٧ سبتمبر ٢٠٢٦): «لو فيه أيّ مشكلة مستقبليّة، خلاص
 * قدّامنا زرٌّ واحد يسوّي الكلام هذا كلّه». فأيُّ خللٍ في النتيجة يُعالَج بإعادة الضغط،
 * لا بترقيعِ صفوفٍ بعينها.
 *
 * **لا يُعدَّل عميلٌ ولا يُحذف.** يُنشأ الطلب، ويُضبط `Client.activeOrderId` ليشير إليه —
 * وهو الحقلُ الذي تقرأ منه بطاقةُ الاشتراك.
 *
 * وما لا يُعرف لا يُخمَّن: يُكتب الطلبُ على كلّ حال، ويُوسَم في `notes` بما ينقصه،
 * ويُرجَع في جدول «يحتاج مراجعة» ليُصحَّح يدويّاً (قرار خالد: «يحتاج مراجعة وأنا أراجع يدوي»).
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * الحارسُ نفسُه الذي تقرؤه الشاشة — تعريفٌ واحد في `lib/orders-migration-gate.ts`.
 * ولو انشقّ التعريفُ بينهما لظهر زرٌّ يرفضه الخادم، أو زرٌّ يعمل والشاشةُ تقول «تمّ».
 */
async function refuseUnlessAllowed(): Promise<Response | null> {
  if (!process.env.DATABASE_URL) return Response.json({ error: "DATABASE_URL is not set" }, { status: 500 });
  const gate = await checkOrdersMigrationGate();
  if (gate.allowed) return null;
  if (gate.reason === "unauthenticated") return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (gate.reason === "forbidden") return Response.json({ error: "مديرُ النظام وحده يُجري الترحيل" }, { status: 403 });
  return Response.json(
    { error: `الترحيلُ تمّ — ${gate.orders} طلباً في الجدول. لا يُعاد على قاعدةٍ فيها طلبات.` },
    { status: 409 },
  );
}

/** جردٌ للقراءة: ما سيُمسح، وما سيُكتب لكلّ عميل، ومن يحتاج مراجعة. */
export async function GET() {
  const refused = await refuseUnlessAllowed();
  if (refused) return refused;

  const [orders, invoices, planned] = await Promise.all([
    db.checkoutOrder.count(),
    db.invoice.count(),
    planAll(),
  ]);

  return Response.json({
    willDelete: { checkout_orders: orders, invoices },
    planned: planned.map(serialise),
    totals: summarise(planned),
  });
}

function serialise(p: PlannedOrder) {
  return {
    ...p,
    serviceStartedAt: p.serviceStartedAt ? p.serviceStartedAt.toISOString().slice(0, 10) : null,
    activatedAt: p.activatedAt.toISOString().slice(0, 10),
  };
}

function summarise(planned: PlannedOrder[]) {
  const clean = planned.filter((p) => p.gaps.length === 0).length;
  const byCurrency: Record<string, { count: number; totalMinor: number }> = {};
  for (const p of planned) {
    const k = p.currency ?? "—";
    byCurrency[k] ??= { count: 0, totalMinor: 0 };
    byCurrency[k].count += 1;
    byCurrency[k].totalMinor += p.totalMinor;
  }
  return { clients: planned.length, clean, needsReview: planned.length - clean, byCurrency };
}

/**
 * **التنفيذ يُبَثّ سطراً سطراً** (NDJSON) لا يُرجَع دفعةً واحدة.
 *
 * البناءُ يمرّ على العملاء واحداً واحداً، وكلُّ واحدٍ استعلامان أو ثلاثة — فالانتظارُ
 * عندنا ثوانٍ، وعلى الإنتاج أطول. وشريطٌ يدور بلا رقمٍ لا يقول أين وصل، فيبدو المعلَّقُ
 * كالعامل. فيُرسَل سطرٌ بعد كلّ عميل، والشاشةُ تعدّ ما وصلها فيصير التقدّمُ مقيساً
 * لا مُوهَماً (خالد ١٨ سبتمبر ٢٠٢٦: «الصفحة تعطيك progress bar»).
 *
 * والسطرُ الأخير `type:"result"` هو نفسُه الجسمُ الذي كان يُرجَع — فلا تتغيّر النتيجة،
 * إنّما يُعرف طريقُها.
 */
export async function POST(_req: NextRequest) {
  const refused = await refuseUnlessAllowed();
  if (refused) return refused;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (line: unknown) => controller.enqueue(encoder.encode(JSON.stringify(line) + String.fromCharCode(10)));
      try {
        await runRebuild(send);
      } catch (e) {
        send({ type: "fatal", error: e instanceof Error ? e.message : "خطأٌ غير متوقَّع" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      // بلا هذا يجمّع بعضُ الوسطاء الردَّ فيصل دفعةً واحدة، فيموت التقدّم صامتاً.
      "X-Accel-Buffering": "no",
    },
  });
}

type Send = (line: unknown) => void;

async function runRebuild(send: Send) {
  const startedAt = Date.now();
  send({ type: "phase", phase: "plan" });
  const planned = await planAll();
  send({ type: "phase", phase: "skip", total: planned.length });

  /**
   * **لا يُمسح شيء — الترحيلُ إضافيٌّ يتخطّى مَن له طلبٌ بالفعل** (خالد ١٩ سبتمبر ٢٠٢٦).
   *
   * ── ما كان ──
   * كان يمسح `checkout_orders` و`invoices` والمعاملات كلَّها ثمّ يبني من جديد. وهو آمنٌ
   * على قاعدةٍ لم يدخلها طلبٌ حقيقيٌّ قطّ، وكارثةٌ على غيرها — ولذلك كان حارسُه يمنعه
   * متى وُجد طلبٌ واحد (`lib/orders-migration-gate.ts`).
   *
   * ── ولماذا سقط المسح ──
   * قيس الإنتاج (١٩ سبتمبر ٢٠٢٦) فوُجدت فيه **ستّةُ طلبات**: اثنان فحصٌ داخليّ وأربعةٌ
   * زوّارٌ حقيقيّون فتحوا صفحة الدفع ولم يُكملوا (`ORD-2026-00003..6` بإيميلاتٍ حقيقيّة،
   * `clientId: null`). فصفحةُ الدفع منشورةٌ وتكتب في الجدول منذ ١٥ سبتمبر — والحارسُ كان
   * سيرفض الترحيلَ للأبد، فيبقى ٤٢ عميلاً بلا طلبٍ ساري وشاشاتُ المال فارغةً هناك.
   *
   * فصار الترحيلُ إضافيّاً: يقرأ مَن له طلبٌ الآن ويتخطّاه، ولا يلمس طلباً ولا فاتورةً
   * ولا معاملةً قائمة. وبهذا يُعاد تشغيلُه بلا خوف: الثانيةُ لا تفعل شيئاً.
   */
  const alreadyHaveOrders = new Set(
    (await db.checkoutOrder.findMany({ where: { NOT: [{ clientId: null }] }, select: { clientId: true } }))
      .map((o) => o.clientId as string),
  );
  const skipped = planned.filter((p) => alreadyHaveOrders.has(p.clientId)).map((p) => p.clientName);
  const toBuild = planned.filter((p) => !alreadyHaveOrders.has(p.clientId));
  send({ type: "phase", phase: "build", total: toBuild.length, skipped: skipped.length });

  // ── ٢) البناء
  const created: { number: string; clientName: string; currency: string | null; totalMinor: number; gaps: string[] }[] = [];
  const failed: { clientName: string; error: string }[] = [];

  for (const p of toBuild) {
    try {
      const number = await nextOrderNumber(db);
      const monthlyBaseMinor = p.paidMonths > 0 ? Math.round(p.totalMinor / p.paidMonths) : p.totalMinor;
      const buyer = await db.client.findUnique({
        where: { id: p.clientId },
        select: { name: true, email: true, phone: true },
      });

      const order = await db.checkoutOrder.create({
        data: {
          number,
          buyerName: buyer?.name ?? p.clientName,
          buyerEmail: buyer?.email ?? "",
          buyerPhone: buyer?.phone ?? "",
          country: p.market,
          market: p.market ?? "SA",
          currency: p.currency ?? "SAR",
          planId: p.planId,
          planSlug: p.planSlug ?? "unknown",
          planName: p.planName ?? "—",
          articlesPerMonth: p.articlesPerMonth,
          monthlyBaseMinor,
          paidMonths: p.paidMonths,
          bonusServiceMonths: 0,
          subtotalMinor: p.totalMinor,
          vatRateBp: 0,
          vatMinor: 0,
          totalMinor: p.totalMinor,
          status: "PAID",
          paidAt: p.serviceStartedAt,
          serviceStartedAt: p.serviceStartedAt,
          activatedAt: p.activatedAt,
          salesRepId: p.salesRepId,
          // تاريخُ الطلب = يومُ التفعيل، لا يومُ تشغيل الترحيل (خالد ١٨ سبتمبر ٢٠٢٦):
          // ٤٢ طلباً بتاريخٍ واحد هو يومُ الضغط على الزرّ لا يقول شيئاً عن العميل.
          createdAt: p.activatedAt,
          clientId: p.clientId,
          notes: p.gaps.length
            ? `⚠ ترحيلٌ يحتاج مراجعة — ${p.gaps.join(" · ")}`
            : "طلبٌ مُرحَّل من بيانات العميل القديمة",
        },
      });

      // معاملةٌ بمزوّد `MIGRATED`: الترحيلُ يكتب بوّابته بنفسه، فعمودُ البوّابة لا يستنتج،
      // وطلبٌ بلا معاملةٍ يبقى إشارةَ عطلٍ حقيقيّ لا حالةً تُفسَّر بحسن نيّة.
      await db.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider: "MIGRATED",
          status: "MIGRATED",
          amountMinor: p.totalMinor,
          currency: p.currency ?? "SAR",
          providerReference: "rebuild-orders",
          settledAt: p.serviceStartedAt,
        },
      });

      // نهايةُ الاشتراك تُشتقّ من الطلب المبنيّ لتوّه — فيتطابق ما يراه العميلُ في بوّابته
      // مع ما يقوله الأدمن من أوّل لحظة (كان الانقسام صفرَ تطابقٍ من ٤٢).
      //
      // و**من بداية الخدمة لا من يوم التفعيل** (خالد ١٩ سبتمبر ٢٠٢٦: «المدّة تبدأ بعد أوّل
      // أرتيكل»): بدايةُ الخدمة هنا هي أوّلُ مقالٍ وصل العميل (`plan.ts`)، فيُحسب من نفس
      // النقطة التي يحسب منها `recompute-subscription-end.ts` وشاشةُ الطلبات — صيغةٌ واحدة
      // في المسارات الثلاثة. ومَن لم يصله مقالٌ بعد تبقى نهايتُه فارغةً: لم تبدأ مدّتُه.
      await db.client.update({
        where: { id: p.clientId },
        data: {
          activeOrderId: order.id,
          subscriptionStartDate: p.serviceStartedAt,
          subscriptionEndDate: p.serviceStartedAt
            // والهديّةُ صفرٌ في الطلب المُرحَّل (سطر `bonusServiceMonths: 0` أعلاه) — فلا تُضاف
            // هنا رقماً لا يحمله الطلبُ نفسُه.
            ? addMonthsTo(p.serviceStartedAt, p.paidMonths)
            : null,
        },
      });
      created.push({ number, clientName: p.clientName, currency: p.currency, totalMinor: p.totalMinor, gaps: p.gaps });
      send({ type: "progress", done: created.length + failed.length, total: toBuild.length, name: p.clientName, number, gaps: p.gaps });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failed.push({ clientName: p.clientName, error: message });
      // الفشلُ يُبثّ كما يُبثّ النجاح — وإلّا توقّف العدّادُ عند صفٍّ ولم يُعرف أيُّه.
      send({ type: "progress", done: created.length + failed.length, total: toBuild.length, name: p.clientName, error: message });
    }
  }

  // ── ٣) التحقّق البعديّ — العدُّ المُعاد هو الدليل، لا ما ادّعاه الإنشاء
  const [orderCount, linkedCount, clientCount] = await Promise.all([
    db.checkoutOrder.count(),
    db.checkoutOrder.count({ where: { NOT: [{ clientId: null }] } }),
    db.client.count(),
  ]);
  const pointerCount = await db.client.count({ where: { NOT: [{ activeOrderId: null }] } });

  /**
   * **معيارُ النظافة بعد أن صار الترحيلُ إضافيّاً.**
   *
   * كان `orders === clients` يصحّ حين يُمسح كلُّ شيءٍ ويُبنى صفٌّ لكلّ عميل. واليوم في
   * الجدول طلباتُ زوّارٍ بلا عميل (`clientId: null` — فتحوا صفحة الدفع ولم يُكملوا)،
   * وقد يكون للعميل الواحد طلبان: تأسيسٌ وتجديد. فالمعيارُ الصادق: **ألّا يبقى عميلٌ
   * بلا طلبٍ ساري**، وألّا يفشل صفّ.
   */
  const clientsWithoutPointer = clientCount - pointerCount;
  const clean = failed.length === 0 && clientsWithoutPointer === 0;

  send({
    type: "result",
    clean,
    skipped: skipped.length,
    clientsWithoutPointer,
    created: created.length,
    failed,
    verify: { clients: clientCount, orders: orderCount, ordersLinked: linkedCount, clientsPointing: pointerCount },
    needsReview: created.filter((c) => c.gaps.length > 0),
    totals: summarise(planned),
    durationMs: Date.now() - startedAt,
  });
}
