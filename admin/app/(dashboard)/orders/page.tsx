import type { CheckoutOrderStatus, PaymentProvider } from "@prisma/client";
import { Plus } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { OrderStatusFilter } from "./components/order-status-filter";
import { OrdersTable, type CurrencyTotal, type OrderRow } from "./components/orders-table";
import { formatMonths } from "./helpers/format-months";
import { formatOrderAmount } from "./helpers/format-order-amount";
import { formatOrderDate } from "./helpers/format-order-date";
import { formatOrderMoney } from "./helpers/format-order-money";
import { getFirstPublishedDates } from "./helpers/get-first-published-dates";
import { getSubscriptionStanding } from "./helpers/get-subscription-standing";
import { orderMarketLabel } from "./helpers/order-market-label";
import { orderProviderLabel } from "./helpers/order-provider-label";
import { AWAITING_ACTIVATION } from "@/lib/orders/awaiting-activation";

export const dynamic = "force-dynamic";

const STATUSES: CheckoutOrderStatus[] = ["AWAITING_PAYMENT", "AWAITING_TRANSFER", "PAID", "FAILED", "CANCELLED", "REFUNDED"];
const PROVIDERS: PaymentProvider[] = ["NGENIUS", "TAMARA", "BANK_TRANSFER", "INSTAPAY", "MIGRATED"];
/** السوقان المعلنان — يُعرض إجماليّاهما معاً دائماً، ولو كان أحدهما صفراً. */
const MARKET_CURRENCIES = [
  { currency: "EGP", market: "مصر" },
  { currency: "SAR", market: "السعودية" },
] as const;
const TAKE = 50;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; view?: string; provider?: string }> }) {
  const { status, view, provider } = await searchParams;
  const activeStatus = STATUSES.find((candidate) => candidate === status);
  // البوّابة من المعاملة (`payment_transactions`) لا من الطلب — الترحيل يكتب `MIGRATED` بنفسه.
  const activeProvider = PROVIDERS.find((candidate) => candidate === provider);
  // مشهدٌ لا حالة: «ينتظر التفعيل» = مدفوعٌ بلا `clientId`، وهو غيابُ حقلٍ لا قيمةُ status.
  const isAwaitingView = view === "awaiting-activation";
  // «اشتراكٌ منتهٍ» يُحسب من التفعيل + شهور الخدمة ولا يُخزَّن، فلا يُفلتر في القاعدة:
  // تُجلب المدفوعةُ المفعَّلة كلُّها ويُرشَّح المنتهي منها هنا.
  const isExpiredView = view === "expired";

  /** شرطُ الفلتر الواحد — يقود الجدولَ والإجماليَّ معاً فلا يقول أحدُهما غيرَ ما يقوله الآخر. */
  const where = isExpiredView
    ? { status: "PAID" as const, NOT: [{ activatedAt: null }] }
    : isAwaitingView
      ? AWAITING_ACTIVATION
      : activeProvider
        ? { transactions: { some: { provider: activeProvider } } }
        : activeStatus
          ? { status: activeStatus }
          : undefined;

  const [fetched, total, countRows, awaitingActivation, expiredCount, providerPairs, sumRows] = await Promise.all([
    db.checkoutOrder.findMany({
      where,
      select: {
        id: true, number: true, createdAt: true, activatedAt: true, buyerName: true, market: true,
        planName: true, paidMonths: true, totalMinor: true, currency: true, status: true,
        // للتفعيل: `clientId` يقرّر ظهور الزرّ، والثلاثة الباقية تملأ النافذة بلا استعلامٍ ثانٍ.
        clientId: true, businessName: true, buyerEmail: true, bonusServiceMonths: true,
        // `notes` تبدأ بـ⚠ في الطلب المُرحَّل الذي تناقضت بياناتُه — فيُصبغ صفُّه.
        notes: true,
        transactions: { select: { provider: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: isExpiredView ? 500 : TAKE,
    }),
    db.checkoutOrder.count(),
    db.checkoutOrder.groupBy({ by: ["status"], _count: { _all: true } }),
    db.checkoutOrder.count({ where: AWAITING_ACTIVATION }),
    // عدّادُ المنتهي — بنفس الحاسب الذي يلوّن الصفوف، فلا يقول الزرُّ رقماً يخالف الجدول.
    db.checkoutOrder
      .findMany({
        where: { status: "PAID", NOT: [{ activatedAt: null }] },
        select: { activatedAt: true, paidMonths: true, bonusServiceMonths: true },
        take: 500,
      })
      .then((rows) => rows.filter((r) => getSubscriptionStanding(r).state === "expired").length),
    // طلباتٌ لكلّ بوّابة — `distinct` على (الطلب، المزوّد) لأنّ الطلب الواحد قد يحمل
    // محاولاتٍ عدّة على نفس البوّابة، والعدّادُ يعدّ طلباتٍ لا محاولات.
    db.paymentTransaction.findMany({ select: { orderId: true, provider: true }, distinct: ["orderId", "provider"], take: 5000 }),
    // إجماليُّ الفلتر — بكلّ عملةٍ على حدة، على المجموعة كاملةً لا على الصفحة المعروضة.
    db.checkoutOrder.groupBy({ by: ["currency"], where, _sum: { totalMinor: true } }),
  ]);
  const orders = isExpiredView ? fetched.filter((o) => getSubscriptionStanding(o).state === "expired") : fetched;
  const counts = Object.fromEntries(countRows.map((row) => [row.status, row._count._all])) as Partial<Record<CheckoutOrderStatus, number>>;
  const providerCounts: Partial<Record<PaymentProvider, number>> = {};
  for (const pair of providerPairs) providerCounts[pair.provider] = (providerCounts[pair.provider] ?? 0) + 1;

  /**
   * إجماليّا السوقين معاً دائماً — ولو كان أحدهما صفراً (خالد ١٨ سبتمبر ٢٠٢٦).
   * إخفاءُ الصفر يجعل غيابَ الرقم يُقرأ «لم يُحسب» بدل «لا شيء»، ويقفز موضعُ الآخر
   * بين مشهدٍ وآخر. وكلُّ عملةٍ على حدة — لا يُجمع ريالٌ على جنيه أبداً.
   *
   * و«منتهٍ» يُحسب في الذاكرة لا في القاعدة، فمجموعُه من صفوفه هو؛ وكلُّ مشهدٍ آخر
   * يأتي من `groupBy` فيشمل ما وراء الصفحة المعروضة.
   */
  const sumByCurrency = new Map<string, number>(
    isExpiredView
      ? [...orders.reduce((m, o) => m.set(o.currency, (m.get(o.currency) ?? 0) + o.totalMinor), new Map<string, number>())]
      : sumRows.map((r) => [r.currency, r._sum.totalMinor ?? 0]),
  );
  // رقماً بلا عملة: اسمُ البلد فوقه يقولها — «مصر» جنيهٌ و«السعودية» ريال، ولا ثالثَ لهما.
  const totals: CurrencyTotal[] = MARKET_CURRENCIES.map(({ currency, market }) => ({
    currency,
    market,
    label: formatOrderAmount(sumByCurrency.get(currency) ?? 0),
  }));
  // يعتمد على الطلبات المجلوبة، فلا يدخل `Promise.all` أعلاه.
  const firstArticleAt = await getFirstPublishedDates(
    orders.flatMap((order) => (order.clientId ? [order.clientId] : [])),
  );

  /**
   * الصفوف تُنسَّق هنا وتُرسَل نصّاً: الجدولُ المشترك مكوّنُ عميل (بحث · فرز · ترقيم —
   * معيار الكيانات #٣)، والتنسيقُ يبقى في الخادم حيث المنسّقات.
   *
   * الطلبُ المُرحَّل الذي تناقضت بياناتُه يُوسم `needsReview`: الترحيل بنى ٤٢ طلباً من
   * بياناتٍ متضاربة (`billingCycle` خالف المبلغَ في ٢٣ من ٢٨)، فما خُمّنت المدّة — وُسمت
   * في `notes` بادئةً بـ⚠. ومراجعةُ سبعةٍ وثلاثين صفّاً بفتح كلٍّ منها على حدة تضيع.
   */
  const rows: OrderRow[] = orders.map((order) => {
    const firstArticle = order.clientId ? firstArticleAt.get(order.clientId) ?? null : null;
    const totalLabel = formatOrderMoney(order.totalMinor, order.currency);
    const termLabel = formatMonths(order.paidMonths);
    const standing = getSubscriptionStanding(order);
    return {
      subscriptionState: standing.state,
      subscriptionDaysLeft: standing.daysLeft,
      subscriptionEndsLabel: standing.endsAt ? formatOrderDate(standing.endsAt) : null,
      id: order.id,
      number: order.number,
      needsReview: order.notes?.startsWith("⚠") ?? false,
      notes: order.notes,
      createdAtLabel: formatOrderDate(order.createdAt),
      createdAtMs: order.createdAt.getTime(),
      activatedAtLabel: order.activatedAt ? formatOrderDate(order.activatedAt) : null,
      activatedAtMs: order.activatedAt?.getTime() ?? null,
      firstArticleLabel: firstArticle ? formatOrderDate(firstArticle) : null,
      firstArticleMs: firstArticle?.getTime() ?? null,
      buyerName: order.buyerName,
      marketLabel: orderMarketLabel(order.market),
      planName: order.planName,
      termLabel,
      paidMonths: order.paidMonths,
      totalLabel,
      amountLabel: formatOrderAmount(order.totalMinor),
      totalMinor: order.totalMinor,
      status: order.status,
      // من المعاملة وحدها — المُرحَّل له معاملةُ `MIGRATED` يكتبها الترحيل نفسه، فـ«—» هنا
      // يعني طلباً بلا معاملةٍ فعلاً (خالد ١٨ سبتمبر: «لو فيه بوّابة مو شغّالة نكون عارفين»).
      providerLabel: order.transactions[0] ? orderProviderLabel(order.transactions[0].provider) : null,
      // الشرط هو تعريف «ينتظر التفعيل» نفسه: مدفوعٌ بلا كرت. لا حالةَ ثالثة.
      activatable:
        order.status === "PAID" && !order.clientId
          ? {
              id: order.id,
              number: order.number,
              buyerName: order.buyerName,
              businessName: order.businessName,
              buyerEmail: order.buyerEmail,
              planName: order.planName,
              totalLabel,
              termLabel: termLabel + (order.bonusServiceMonths ? ` + ${formatMonths(order.bonusServiceMonths)} هديّة` : ""),
            }
          : null,
    };
  });

  const emptyText = isExpiredView
    ? "لا اشتراكات منتهية — كلُّ المفعَّل ساري."
    : activeProvider
      ? "لا اشتراكات عبر هذه البوّابة."
    : isAwaitingView
    ? "ما فيه طلبٌ ينتظر التفعيل — كل طلبٍ مدفوع له حساب عميل."
    : activeStatus
      ? "لا طلبات بهذه الحالة — جرّب حالة أخرى من الأعلى."
      : "لا طلبات بعد — تظهر هنا بمجرد أن يبدأ أول عميل الدفع من صفحة الاشتراك.";

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 pb-8" dir="rtl">
      {/* صفٌّ واحد: العنوان · الفلاتر بينهما · زرّ «+» (خالد ١٨ سبتمبر). */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* العددُ رقماً بجانب العنوان — بلا «طلباً». */}
        <h1 className="flex shrink-0 items-baseline gap-2 text-2xl font-semibold">
          الاشتراكات
          <span className="text-base font-bold tabular-nums text-muted-foreground" title={orders.length < TAKE ? undefined : `أحدث ${TAKE} معروضة`}>
            {total}
          </span>
        </h1>
        <div className="min-w-0 flex-1">
          <OrderStatusFilter
            counts={counts}
            total={total}
            active={activeStatus}
            awaitingActivation={awaitingActivation}
            isAwaitingView={isAwaitingView}
            expired={expiredCount}
            isExpiredView={isExpiredView}
            providerCounts={providerCounts}
            activeProvider={activeProvider}
          />
        </div>
        {/* المنفذ الثاني بجانب صفحة الدفع — ومنه تُعاد إدخال العملاء القائمين.
            أيقونة «+» وحدها — والاسمُ في التلميح ولقارئ الشاشة. */}
        <Link
          href="/orders/new"
          aria-label="اشتراك جديد"
          title="اشتراك جديد"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="size-5" strokeWidth={2.5} />
        </Link>
      </header>

      <OrdersTable rows={rows} emptyText={emptyText} totals={totals} />
    </main>
  );
}
