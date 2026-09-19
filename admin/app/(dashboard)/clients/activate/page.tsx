import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Inbox } from "lucide-react";

import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/admin-guard";
import { AWAITING_ACTIVATION } from "@/lib/orders/awaiting-activation";
import { formatOrderAmount } from "@/lib/orders/format-order-amount";
import { orderProviderLabel } from "@/lib/orders/order-provider-label";
import { ActivationQueueTable, type QueueRow } from "./components/activation-queue-table";

/**
 * **طابورُ التفعيل — من دفع ولم يُفتح له حسابٌ بعد.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «لما أضغط على تفعيل عميل، تجيني شاشة قبل تأسيس الشاشة
 * الخاصّة بالعميل — جدولٌ فيه العملاء اللي دفعوا ولم يتمّ تفعيلهم، ولما أضغط عليهم
 * يوديني لصفحة التفعيل».
 *
 * -- ولماذا بابٌ مستقلٌّ عن `/orders` --
 * الوثيقةُ (`ACTIVATION-FLOW.html` §٢) استقرّت على «نافذةٍ في صفّ الطلب»، وكان ذلك
 * صحيحاً يومَ كان مَن يقرأ المال هو مَن يفعّل. ثمّ فصل خالد الدورين (١٩ سبتمبر:
 * «التفعيل دورُ موظّفٍ ثانٍ») — وموظّفُ التفعيل لا شأن له بالإيراد الشهريّ ولا
 * بالاسترداد ولا بالفواتير. فصار له بابُه: قائمةٌ واحدةٌ لا تعرض إلّا ما ينتظره.
 *
 * -- والشرطُ نفسُه لا نسخةٌ منه --
 * `AWAITING_ACTIVATION` هو ما يعدّه توجل «ينتظر التفعيل» في `/orders` وبطاقةُ اللوحة.
 * فلو قال الطابورُ رقماً والتوجلُ غيرَه، لم يعرف أحدٌ أيَّهما يُصدَّق — ولهذا يُقرأ من
 * `lib/orders/awaiting-activation.ts` وحدها.
 *
 * ولا يُفعَّل من هنا بضغطةٍ في الصفّ: الضغطةُ تفتح صفحةَ الطلب حيث تُقرأ بياناتُ المشتري
 * كاملةً قبل فتح حساب — والحسابُ يُرسِل بريداً برابط دخول، فلا يُفتح بنظرةٍ عابرة.
 */
export const dynamic = "force-dynamic";

export const metadata = { title: "Activate Client - Modonty" };

export default async function ActivateClientPage() {
  const gate = await checkAdmin();
  if (gate.status === "unauthenticated") redirect("/login");
  if (gate.status === "forbidden") redirect("/");

  const orders = await db.checkoutOrder.findMany({
    where: AWAITING_ACTIVATION,
    select: {
      id: true, number: true, buyerName: true, businessName: true, buyerEmail: true, buyerPhone: true,
      market: true, planName: true, paidMonths: true, bonusServiceMonths: true,
      totalMinor: true, currency: true, paidAt: true, createdAt: true,
      transactions: { select: { provider: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { paidAt: "asc" },
    take: 200,
  });

  const now = Date.now();
  const rows: QueueRow[] = orders.map((o) => {
    const paidAt = o.paidAt ?? o.createdAt;
    return {
      id: o.id,
      number: o.number,
      buyerName: o.businessName?.trim() || o.buyerName,
      contact: o.buyerEmail,
      phone: o.buyerPhone,
      market: o.market === "EG" ? "مصر" : o.market === "AE" ? "الإمارات" : "السعودية",
      planName: o.planName,
      termLabel: o.bonusServiceMonths
        ? `${o.paidMonths} + ${o.bonusServiceMonths}`
        : String(o.paidMonths),
      amountLabel: formatOrderAmount(o.totalMinor),
      currency: o.currency,
      providerLabel: o.transactions[0] ? orderProviderLabel(o.transactions[0].provider) : null,
      paidAtLabel: paidAt.toLocaleDateString("ar-EG", { day: "2-digit", month: "2-digit", year: "2-digit" }),
      /** كم يوماً والمالُ عندنا والخدمةُ لم تبدأ — وهو ترتيبُ الأولويّة نفسُه. */
      waitingDays: Math.max(0, Math.floor((now - paidAt.getTime()) / 86_400_000)),
    };
  });

  return (
    <main dir="rtl" className="mx-auto flex max-w-6xl flex-col gap-4 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-baseline gap-2 text-2xl font-semibold">
            تفعيل عميل
            <span className="text-base font-bold tabular-nums text-muted-foreground">{rows.length}</span>
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            دفعوا ولم يُفتح لهم حسابٌ بعد. اضغط على الصفّ لتفتح طلبه وتفعّله.
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center">
          <Inbox className="size-7 text-muted-foreground/60" aria-hidden />
          <p className="text-sm font-medium">لا أحدَ ينتظر التفعيل</p>
          <p className="max-w-sm text-[12px] text-muted-foreground">
            كلُّ من دفع صار له حساب. ويظهر هنا أيُّ طلبٍ يصل مالُه ولم يُفتح له حسابٌ بعد.
          </p>
          <Link href="/orders" className="mt-1 inline-flex items-center gap-1 text-[12px] text-primary hover:underline">
            كلّ الاشتراكات
            <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      ) : (
        <ActivationQueueTable rows={rows} />
      )}
    </main>
  );
}
