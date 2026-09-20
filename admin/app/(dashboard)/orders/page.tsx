import type { CheckoutOrderStatus, PaymentProvider } from "@prisma/client";
import { Plus } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { OrderStatusFilter } from "./components/order-status-filter";
import { OrdersSearch } from "./components/orders-search";
import { MonthlyRevenueStrip, type CurrencyTotal } from "./components/monthly-revenue-strip";
import { getMonthlyRevenue } from "./helpers/get-monthly-revenue";
import { OrdersTable, type OrderRow } from "./components/orders-table";
import { formatMonths } from "./helpers/format-months";
import { formatOrderAmount } from "@/lib/orders/format-order-amount";
import { formatOrderDate } from "./helpers/format-order-date";
import { formatOrderMoney } from "@/lib/orders/format-order-money";
import { getFirstPublishedDates } from "./helpers/get-first-published-dates";
import { getSubscriptionStanding } from "./helpers/get-subscription-standing";
import { orderMarketLabel } from "./helpers/order-market-label";
import { orderProviderLabel } from "@/lib/orders/order-provider-label";
import { AWAITING_ACTIVATION } from "@/lib/orders/awaiting-activation";
import { checkSalesDesk } from "@/lib/require-sales-desk";

export const dynamic = "force-dynamic";

const STATUSES: CheckoutOrderStatus[] = ["AWAITING_PAYMENT", "AWAITING_TRANSFER", "PAID", "FAILED", "CANCELLED", "REFUNDED"];
const PROVIDERS: PaymentProvider[] = ["NGENIUS", "TAMARA", "BANK_TRANSFER", "INSTAPAY", "MIGRATED"];
/**
 * **الأسواقُ الثلاثة — والإجماليّ يُجمَع بالسوق لا بالعملة.**
 *
 * كان يُجمَع بالعملة (`groupBy currency`) وهو يكفي لسوقين لكلٍّ عملتُه. ثمّ صار
 * ما وراء السعوديّة ومصر يُسعَّر **بالريال السعوديّ** أيضاً (خالد ١٩ سبتمبر ٢٠٢٦)، فلو
 * بقي الجمعُ بالعملة لذاب إجماليُّ الإمارات في إجماليّ السعودية وما ظهر صفٌّ ثالثٌ أبداً.
 * والسوقُ حقلٌ على الطلب، فهو ما يُجمَع به.
 *
 * ويُعرض الثلاثة معاً دائماً ولو كان أحدها صفراً: إخفاءُ الصفر يجعل غيابَ الرقم يُقرأ
 * «لم يُحسب» بدل «لا شيء»، ويقفز موضعُ الباقي بين مشهدٍ وآخر.
 */
const MARKETS = ["SA", "EG", "AE"] as const;
const MARKET_LABEL: Record<(typeof MARKETS)[number], string> = { SA: "السعودية", EG: "مصر", AE: "الإمارات" };
/** ما تقوله الترويسةُ عن العملة حين لا تكفي: سوقان بالريال نفسِه. */
const MARKET_HINT: Record<(typeof MARKETS)[number], string> = {
  SA: "بالريال السعوديّ",
  EG: "بالجنيه المصريّ",
  AE: "بالريال السعوديّ — أو ما يعادله بعملة بلد العميل حسب سعر التحويل",
};
const TAKE = 50;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; view?: string; provider?: string; market?: string; q?: string }> }) {
  const { status, view, provider, market, q } = await searchParams;
  const query = (q ?? "").trim();
  // السوق حقلٌ على الطلب نفسه — لا يُستنتج من العملة، فقد تتغيّر العملة ويبقى السوق.
  const activeMarket = MARKETS.find((candidate) => candidate === market);
  const activeStatus = STATUSES.find((candidate) => candidate === status);
  // البوّابة من المعاملة (`payment_transactions`) لا من الطلب — الترحيل يكتب `MIGRATED` بنفسه.
  const activeProvider = PROVIDERS.find((candidate) => candidate === provider);
  // مشهدٌ لا حالة: «ينتظر التفعيل» = مدفوعٌ بلا `clientId`، وهو غيابُ حقلٍ لا قيمةُ status.
  const isAwaitingView = view === "awaiting-activation";
  // «اشتراكٌ منتهٍ» يُحسب من التفعيل + شهور الخدمة ولا يُخزَّن، فلا يُفلتر في القاعدة:
  // تُجلب المدفوعةُ المفعَّلة كلُّها ويُرشَّح المنتهي منها هنا.
  const isExpiredView = view === "expired";

  /**
   * البحثُ يُضاف إلى الفلتر لا يحلّ محلَّه — فيقرأ «المصريّون الذين اسمُهم كذا».
   * وهو على القاعدة لا على الصفوف المجلوبة، فيشمل ما وراء الخمسين المعروضة.
   */
  const searchWhere = query
    ? {
        OR: [
          { buyerName: { contains: query, mode: "insensitive" as const } },
          { businessName: { contains: query, mode: "insensitive" as const } },
          { buyerEmail: { contains: query, mode: "insensitive" as const } },
          { number: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : null;

  /** شرطُ الفلتر الواحد — يقود الجدولَ والإجماليَّ معاً فلا يقول أحدُهما غيرَ ما يقوله الآخر. */
  const filterWhere = isExpiredView
    ? { status: "PAID" as const, NOT: [{ serviceStartedAt: null }] }
    : isAwaitingView
      ? AWAITING_ACTIVATION
      : activeProvider
        ? { transactions: { some: { provider: activeProvider } } }
        : activeStatus
          ? { status: activeStatus }
          : activeMarket
            ? { market: activeMarket }
            : undefined;

  const where =
    filterWhere && searchWhere ? { AND: [filterWhere, searchWhere] } : (searchWhere ?? filterWhere);

  const [salesDeskGate, fetched, total, countRows, awaitingActivation, expiredCount, providerPairs, marketRows, sumRows] = await Promise.all([
    checkSalesDesk(),
    db.checkoutOrder.findMany({
      where,
      select: {
        id: true, number: true, createdAt: true, activatedAt: true, serviceStartedAt: true, buyerName: true, market: true,
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
        // ساعةُ الاشتراك من بداية الخدمة (أوّل مقالٍ وصل العميل) لا من يوم التفعيل
        // — خالد ١٩ سبتمبر ٢٠٢٦. ومن لم تبدأ خدمتُه لا يُعدّ منتهياً ولا قريبَ الانتهاء.
        where: { status: "PAID", NOT: [{ serviceStartedAt: null }] },
        select: { serviceStartedAt: true, paidMonths: true, bonusServiceMonths: true },
        take: 500,
      })
      .then((rows) => rows.filter((r) => getSubscriptionStanding(r).state === "expired").length),
    // طلباتٌ لكلّ بوّابة — `distinct` على (الطلب، المزوّد) لأنّ الطلب الواحد قد يحمل
    // محاولاتٍ عدّة على نفس البوّابة، والعدّادُ يعدّ طلباتٍ لا محاولات.
    db.paymentTransaction.findMany({ select: { orderId: true, provider: true }, distinct: ["orderId", "provider"], take: 5000 }),
    // طلباتٌ لكلّ سوق — على الجدول كلِّه لا على الصفحة المعروضة.
    db.checkoutOrder.groupBy({ by: ["market"], _count: { _all: true } }),
    // إجماليّا السوقين — على الجدول كلِّه دائماً، لا على المشهد المفلتَر.
    db.checkoutOrder.groupBy({ by: ["market"], _sum: { totalMinor: true } }),
  ]);
  const isSalesDesk = salesDeskGate.status === "ok";
  const orders = isExpiredView ? fetched.filter((o) => getSubscriptionStanding(o).state === "expired") : fetched;
  const counts = Object.fromEntries(countRows.map((row) => [row.status, row._count._all])) as Partial<Record<CheckoutOrderStatus, number>>;
  const providerCounts: Partial<Record<PaymentProvider, number>> = {};
  for (const pair of providerPairs) providerCounts[pair.provider] = (providerCounts[pair.provider] ?? 0) + 1;
  const marketCounts = Object.fromEntries(marketRows.map((row) => [row.market, row._count._all])) as Partial<Record<string, number>>;

  /**
   * إجماليّا السوقين معاً دائماً — ولو كان أحدهما صفراً (خالد ١٨ سبتمبر ٢٠٢٦).
   * إخفاءُ الصفر يجعل غيابَ الرقم يُقرأ «لم يُحسب» بدل «لا شيء»، ويقفز موضعُ الآخر
   * بين مشهدٍ وآخر. وكلُّ عملةٍ على حدة — لا يُجمع ريالٌ على جنيه أبداً.
   *
   * **ولا يتبعان الفلتر** (خالد ١٩ سبتمبر ٢٠٢٦: «الإجمالي، مصر والسعودية مفروض يجي
   * الاثنين، ما لها علاقة بالتوغل»). كانا يُحسبان بشرط الفلتر نفسِه، فالضغطُ على
   * «السعودية» يُنزل إجماليَّ مصر إلى صفر — ورقمٌ يختفي بضغطةٍ يُقرأ خسارةً لا ترشيحاً.
   * وهما هنا بمعنى «كم دخل في كلّ سوق»، وهذا سؤالٌ لا يتغيّر جوابُه باختيار عمودٍ يُعرض.
   */
  const sumByMarket = new Map<string, number>(sumRows.map((r) => [r.market, r._sum.totalMinor ?? 0]));
  const totals: CurrencyTotal[] = MARKETS.map((code) => ({
    code,
    market: MARKET_LABEL[code],
    hint: MARKET_HINT[code],
    label: formatOrderAmount(sumByMarket.get(code) ?? 0),
  }));
  /**
   * الإيرادُ الشهريُّ لا يتبع الفلتر ولا البحث — كالإجماليّين تماماً. سؤالُه «كم دخل
   * في كلّ شهر»، وجوابُه لا يتغيّر باختيار عمودٍ يُعرض.
   */
  const monthly = await getMonthlyRevenue();

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
      {/**
        * سطران لا سطرٌ واحد (خالد ١٩ سبتمبر ٢٠٢٦: «ارفع لي الاشتراكات والزائد فوق في
        * سطرٍ لوحده… والاشتراك والحالة والسوق والبوّابات كلّها في سطرٍ واحد»).
        *
        * كانت الأربعُ تتقاسم الصفَّ مع العنوان والزرّ، فتُلفَّ مجموعةٌ أو اثنتان إلى سطرٍ
        * ثانٍ كلّما ضاقت الشاشة — فيصير موضعُ «البوّابة» يتغيّر بعرض النافذة لا بمعناها.
        * والعينُ تتعلّم الموضعَ قبل أن تقرأ الاسم.
        */}
      <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        {/* العددُ رقماً بجانب العنوان — بلا «طلباً». */}
        <h1 className="flex shrink-0 items-baseline gap-2 text-2xl font-semibold">
          الاشتراكات
          <span className="text-base font-bold tabular-nums text-muted-foreground" title={orders.length < TAKE ? undefined : `أحدث ${TAKE} معروضة`}>
            {total}
          </span>
        </h1>
        {/* البحثُ بين العنوان وزرّ «+» (خالد ١٩ سبتمبر ٢٠٢٦) — ويأخذ ما بقي من الصفّ. */}
        <OrdersSearch />
        {/**
          * المنفذ الثاني بجانب صفحة الدفع — ومنه تُعاد إدخال العملاء القائمين.
          * أيقونة «+» وحدها — والاسمُ في التلميح ولقارئ الشاشة.
          *
          * **ولا يُعرض لمن لا يقدر يستعمله** (خالد ٢٠ سبتمبر ٢٠٢٦): كان `<Link>` عارياً
          * بلا شرط، وصفحةُ `/orders/new` تبدأ بـ`requireFinanceAdmin()` التي **ترمي**.
          * فالسيلز يرى الزرّ، يضغطه، فتُصفعه صفحةُ خطأ. وهو عكسُ العطل الآخر في نفس
          * اليوم — هناك زرٌّ اختفى بلا سبب، وهنا زرٌّ يظهر ثمّ يرفض.
          */}
        {isSalesDesk ? (
        <Link
          href="/orders/new"
          aria-label="اشتراك جديد"
          title="اشتراك جديد"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="size-5" strokeWidth={2.5} />
        </Link>
        ) : null}
      </div>

      <div className="min-w-0">
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
            marketCounts={marketCounts}
            marketLabels={MARKET_LABEL}
            activeMarket={activeMarket}
          />
        </div>
      </header>

      <MonthlyRevenueStrip data={monthly} totals={totals} />

      <OrdersTable rows={rows} emptyText={emptyText} />
    </main>
  );
}
