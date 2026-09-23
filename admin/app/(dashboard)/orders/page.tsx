import type { CheckoutOrderStatus, PaymentProvider } from "@prisma/client";
import { Plus } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { OrderStatusFilter } from "./components/order-status-filter";
import { OrdersSearch } from "./components/orders-search";
import { MonthlyRevenueStrip, type CurrencyTotal } from "./components/monthly-revenue-strip";
import { getMonthlyRevenue } from "./helpers/get-monthly-revenue";
import { OrdersTable, type ClientGroup, type GroupStanding, type OrderRow } from "./components/orders-table";

import { formatMonths } from "./helpers/format-months";
import { formatOrderAmount } from "@/lib/orders/format-order-amount";
import { formatOrderDate } from "./helpers/format-order-date";
import { formatOrderMoney } from "@/lib/orders/format-order-money";
import { getFirstPublishedDates } from "./helpers/get-first-published-dates";
import { getSubscriptionStanding } from "./helpers/get-subscription-standing";
import { getExpiredActiveOrderIds } from "./helpers/get-expired-active-order-ids";
import { getClientSubscriptions, type ClientSubscription } from "@/lib/subscription/get-client-subscriptions";
import { REVENUE_ORDER } from "@/lib/orders/revenue-order";
import { orderMarketLabel } from "./helpers/order-market-label";
import { orderProviderLabel } from "@/lib/orders/order-provider-label";
import { AWAITING_ACTIVATION } from "@/lib/orders/awaiting-activation";
import { checkSalesDesk } from "@/lib/require-sales-desk";

export const dynamic = "force-dynamic";

const STATUSES: CheckoutOrderStatus[] = ["AWAITING_PAYMENT", "AWAITING_TRANSFER", "PAID", "FAILED", "CANCELLED", "REFUNDED"];
/** مجموعةٌ قيد البناء — المالُ بعملاته قبل أن يُنسَّق نصّاً، والحالُ بعد اكتمال صفوفها. */
type OrderGroup = Omit<ClientGroup, "paidLabel" | "standing"> & { paid: Map<string, number> };

/**
 * حالُ العميل في سطره — من طلبه الساري (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد)، نفسُ ما تعدّه
 * شريحةُ «منتهٍ». بلا طلبٍ ساري ← «—»؛ والإلغاءُ اليدويّ يُقال «ملغى».
 *
 * و«حسابٌ لنا» لا يُقال منتهياً ولا يُصبغ (`NOT_INTERNAL` في `segments.ts`): العدّادُ يستثنيه،
 * فلو صُبغ سطرُه لقال الجدولُ رقماً غيرَ رقم الحبّة. تبقى باقتُه، والاشتراكُ «—».
 */
function clientStanding(
  sub: ClientSubscription | undefined,
  card: { activeOrderId: string | null; isInternal: boolean | null } | undefined,
): GroupStanding {
  if (!sub) return { planName: null, state: "unknown", daysLeft: null, endsLabel: null, orderId: null };
  if (card?.isInternal === true) return { planName: sub.planName, state: "unknown", daysLeft: null, endsLabel: null, orderId: null };
  return {
    planName: sub.planName,
    state: sub.status === "CANCELLED" ? "cancelled" : (sub.state ?? "unknown"),
    daysLeft: sub.daysLeft,
    endsLabel: sub.endsAt ? formatOrderDate(sub.endsAt) : null,
    orderId: sub.hasOrder ? (card?.activeOrderId ?? null) : null,
  };
}

/** من لم يُفعَّل بعد لا طلبَ ساريَ له — فحالُه حالُ طلبه هو: أحدثُ مدفوع، وإلّا أحدثُ طلب. */
function ownOrderStanding(rows: OrderRow[]): GroupStanding {
  const own = rows.find((r) => r.status === "PAID") ?? rows[0];
  return {
    planName: own?.planName ?? null,
    state: own?.subscriptionState ?? "unknown",
    daysLeft: own?.subscriptionDaysLeft ?? null,
    endsLabel: own?.subscriptionEndsLabel ?? null,
    orderId: own?.id ?? null,
  };
}

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
  const isExpiredView = view === "expired";
  /**
   * «منتهٍ» = **الطلبُ الساري لعميلٍ انتهى اشتراكُه** (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد)، لا كلُّ
   * طلبٍ مدفوعٍ انقضت مدّتُه: كان يعدّ الطلبَ القديم لعميلٍ جدّد، والحساباتِ الداخليّة. فالعدّادُ
   * والقائمةُ = شريحةُ `/clients/segment/expired`. يُنتظر قبل الفلتر في مشهد «منتهٍ» وحده، وفي
   * غيره يجري بالتوازي مع الباقي.
   */
  const expiredOrderIdsPromise = getExpiredActiveOrderIds();
  const expiredOrderIds = isExpiredView ? await expiredOrderIdsPromise : null;

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
  const filterWhere = expiredOrderIds
    ? { id: { in: expiredOrderIds } }
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

  const [salesDeskGate, orders, total, countRows, awaitingActivation, expiredCount, providerPairs, marketRows, sumRows] = await Promise.all([
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
    // عدّادُ «منتهٍ» — نفسُ المعرّفات التي تُفلتر بها قائمتُه، فلا يقول الزرُّ رقماً يخالف الجدول.
    expiredOrderIdsPromise.then((ids) => ids.length),
    // طلباتٌ لكلّ بوّابة — `distinct` على (الطلب، المزوّد) لأنّ الطلب الواحد قد يحمل
    // محاولاتٍ عدّة على نفس البوّابة، والعدّادُ يعدّ طلباتٍ لا محاولات.
    db.paymentTransaction.findMany({ select: { orderId: true, provider: true }, distinct: ["orderId", "provider"], take: 5000 }),
    // طلباتٌ لكلّ سوق — على الجدول كلِّه لا على الصفحة المعروضة.
    db.checkoutOrder.groupBy({ by: ["market"], _count: { _all: true } }),
    // إجماليّا السوقين — على الجدول كلِّه دائماً، لا على المشهد المفلتَر. **والمقبوضُ وحده**:
    // كان يجمع كلَّ حالة، فبقي المستردُّ فيه (مقيسٌ ٢٣ سبتمبر ٢٠٢٦: «مصر ١١٤٬١٢٩» وفيه ٥٬٠٠٠
    // مستردّة). و«حسابٌ لنا» خارجٌ كما يَعِد مربّعُه — نفسُ شرط `get-monthly-revenue.ts`.
    db.checkoutOrder.groupBy({ by: ["market"], where: REVENUE_ORDER, _sum: { totalMinor: true } }),
  ]);
  const isSalesDesk = salesDeskGate.status === "ok";
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
  const pageClientIds = [...new Set(orders.flatMap((order) => (order.clientId ? [order.clientId] : [])))];
  const [firstArticleAt, clientCards, clientSubs] = await Promise.all([
    getFirstPublishedDates(pageClientIds),
    // اسمُ العميل من كرته لا من الطلب: المشتري قد يكون موظّفاً والحسابُ باسم المنشأة.
    // ومؤشّرُ الطلب الساري و«حسابٌ لنا» — لحال سطره (`clientStanding`).
    pageClientIds.length
      ? db.client.findMany({
          where: { id: { in: pageClientIds } },
          select: { id: true, name: true, activeOrderId: true, isInternal: true },
        })
      : Promise.resolve([]),
    // حالُ كلّ عميلٍ في الصفحة من طلبه الساري — لسطره في الجدول (الباقة · الاشتراك · الصبغة).
    pageClientIds.length
      ? getClientSubscriptions({ id: { in: pageClientIds } })
      : Promise.resolve(new Map<string, ClientSubscription>()),
  ]);
  const clientById = new Map(clientCards.map((c) => [c.id, c]));

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

  /**
   * **الجدولُ بالعميل، وطلباتُه تحته** (خالد ٢٣ سبتمبر ٢٠٢٦: «الكنترول يكون في العميل…
   * ماني قادر أعرف العميل»). التجديدُ طلبٌ جديد للعميل نفسِه، فكان العميلُ يتفرّق صفوفاً.
   *
   * المفتاحُ حسابُ العميل، ولمن لم يُفعَّل بعد بريدُ المشتري — طلبُه مدفوعٌ ولا كرتَ له،
   * ويبقى ظاهراً لا يسقط من الجدول. والمجموعاتُ مرتّبةٌ بأحدث طلب (ترتيبُ الجلب نفسُه).
   * والطلباتُ داخلها هي المعروضةُ بالفلتر الحاليّ — فلتر «مسترد» يُظهر المستردَّ وحده.
   */
  const groupMap = new Map<string, OrderGroup>();
  orders.forEach((order, i) => {
    const key = order.clientId ?? `buyer:${order.buyerEmail.toLowerCase()}`;
    const group = groupMap.get(key) ?? {
      key,
      clientId: order.clientId,
      name: (order.clientId && clientById.get(order.clientId)?.name) || order.businessName || order.buyerName,
      paid: new Map<string, number>(),
      rows: [],
    };
    group.rows.push(rows[i]);
    if (order.status === "PAID") group.paid.set(order.currency, (group.paid.get(order.currency) ?? 0) + order.totalMinor);
    groupMap.set(key, group);
  });
  const groups: ClientGroup[] = [...groupMap.values()].map(({ paid, ...g }) => ({
    ...g,
    paidLabel: paid.size ? [...paid].map(([currency, minor]) => formatOrderMoney(minor, currency)).join(" + ") : null,
    standing: g.clientId ? clientStanding(clientSubs.get(g.clientId), clientById.get(g.clientId)) : ownOrderStanding(g.rows),
  }));

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

      {/* الفلاترُ والإجماليّاتُ في صفٍّ واحد (خالد ٢٣ سبتمبر ٢٠٢٦: «جنب التوغلز عشان نستفيد
          من المساحة») — الفلترُ في طرف القراءة، والأرقامُ في الطرف المقابل. */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-2">
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
          <MonthlyRevenueStrip data={monthly} totals={totals} />
        </div>
      </header>

      <OrdersTable groups={groups} emptyText={emptyText} />
    </main>
  );
}
