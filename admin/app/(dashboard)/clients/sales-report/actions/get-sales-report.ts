import { InvoicePaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { NOT_INTERNAL } from "../../segment/segments";
import { REVENUE_ORDER } from "@/lib/orders/revenue-order";
import { clientIdsWhere, getClientSubscriptions } from "@/lib/subscription/get-client-subscriptions";
import { invoiceMinor, isOutstandingInvoice } from "@modonty/shared/lib/payments/collected";
import { formatTermLabel } from "@modonty/shared/lib/commercial/term-label";

/** "all" for the whole book, or a month number 1–12 (of the current year). */
export type Period = "all" | number;

export interface Money {
  /** Collected — real cash in: PAID orders only (`isCollectedOrder` via `REVENUE_ORDER`). */
  paid: number;
  /** Outstanding — `isOutstandingInvoice` + `invoiceMinor`, the one debt rule. NOT sales. */
  due: number;
  /** Count of invoices contributing (a PAID opening-balance document is not counted). */
  invoices: number;
}

export interface SalesRepRow {
  id: string;
  name: string;
  clientCount: number;
  sar: Money;
  egp: Money;
}

export interface TierRow {
  tierName: string;
  sar: Money;
  egp: Money;
}

export interface RecentInvoice {
  id: string;
  number: string;
  clientName: string;
  tierName: string;
  /** مدّةُ الطلب — «٦ أشهر + شهر هدية» (`formatTermLabel`)، لا «شهري/سنوي». */
  term: string;
  amount: number;
  currency: string;
  paid: boolean;
  /** حالةُ الفاتورة كما في السكيما — اسمُها من `INVOICE_STATUS_LABEL`. */
  status: InvoicePaymentStatus;
  issuedAt: string;
  /** Raw collection/issue date (ms) for client-side sorting. */
  dateMs: number;
  /** True = this invoice documents an opening balance (already counted) — not new revenue. */
  fromOpeningBalance: boolean;
}

export interface MonthTotal {
  /** 1–12 */
  month: number;
  /** Collected that month, split by currency. */
  sar: number;
  egp: number;
}

export interface SalesReport {
  /** Whole-book collected + outstanding, split by currency — the real sales figures. */
  totals: { sar: Money; egp: Money };
  invoiceCount: number;
  payingClients: number;
  byTier: TierRow[];
  recent: RecentInvoice[];
  reps: SalesRepRow[];
  unassignedCount: number;
  repCount: number;
  assignedClientCount: number;
  /** Overdue = ACTIVE clients whose paid period already ended — a renewal is overdue. */
  expiredCount: number;
  /** Per-month collected of the current year — drives the amount badges on the filter buttons. */
  monthlyTotals: MonthTotal[];
  yearTotal: { sar: number; egp: number };
}

const emptyMoney = (): Money => ({ paid: 0, due: 0, invoices: 0 });

/** Calendar-month bounds (current year) for a month filter; null bounds = whole book. */
function periodBounds(period: Period): { start: Date | null; end: Date | null } {
  if (period === "all") return { start: null, end: null };
  const year = new Date().getFullYear();
  return { start: new Date(year, period - 1, 1), end: new Date(year, period, 1) };
}

// سقطت `currencyForCountry` (١٧ سبتمبر ٢٠٢٦): كانت تشتقّ العملة من نصّ بلد العميل
// لأنّ `openingBalance` رقمٌ بلا عملة. وصار الإيرادُ يُقرأ من الطلب، والطلبُ يحمل
// `currency` صريحةً — فسقط الاشتقاقُ ومعه احتمالُ أن يخطئ في بلدٍ مكتوبٍ بصيغةٍ غريبة.

// عربيّ كبقيّة التقرير — «٢٠ سبتمبر ٢٠٢٦» لا «20 Sept 2026».
const dateFmt = new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "long", day: "numeric" });

/**
 * Sales / revenue report for the whole book, on a CASH basis (Khalid 2026-07-25).
 *
 * Every payment lives on a PAID order — `totalMinor` with its own `currency` and `paidAt` —
 * not on `Client.openingBalance`, which was a bare number dated at the client's createdAt
 * and whose currency had to be guessed from the address (١٧ سبتمبر ٢٠٢٦).
 *
 * An invoice issued FROM an order (or flagged `fromOpeningBalance`) is a document of money
 * the order already carries, so its amount is EXCLUDED here to avoid double-counting.
 *
 * Collected (المحصّل) = PAID orders (by paidAt) — an invoice is a document, never money —
 * the one rule in `shared/lib/payments/collected.ts`, read by every money screen.
 * Outstanding (المستحق) = `isOutstandingInvoice` + `invoiceMinor` from the same file — the
 * account statement's rule — shown separately: a receivable, never counted as sales.
 * Money is split by currency (88% of the audience is Egyptian/EGP) — never summed across
 * SAR + EGP. Archived (void) invoices are excluded. Rep + tier breakdowns are secondary views.
 */
export async function getSalesReport(period: Period = "all"): Promise<SalesReport> {
  const clients = await db.client.findMany({
    where: NOT_INTERNAL,
    select: {
      id: true,
      name: true,
      salesRepId: true,
      createdAt: true,
      addressCountry: true,
    },
    take: 3000,
  });
  const clientById = new Map(clients.map((c) => [c.id, c]));
  const clientIds = clients.map((c) => c.id);

  /**
   * -- الإيرادُ يُقرأ من الطلبات المدفوعة كلِّها، لا من «الطلب الأوّل» --
   *
   * كان التقريرُ يعدّ أوّلَ طلبٍ مدفوعٍ لكلّ عميل ويترك الباقي لفواتيره. وفيه عيبان
   * (خالد ٢٣ سبتمبر ٢٠٢٦):
   * - فاتورةُ الطلب الأوّل لا تُستثنى إلّا إن كانت أولى فواتير العميل
   *   (`plan-invoice-from-order.ts` · `_count.invoices === 0`) — فعميلٌ له فاتورةٌ قديمة
   *   يُعدّ طلبُه مرّتين: مرّةً طلباً ومرّةً فاتورة.
   * - «الأوّل» مرتَّبٌ بـ`serviceStartedAt` صعوداً، ومونغو يضع الفارغ أوّلاً — فتجديدٌ لم
   *   تبدأ خدمتُه يُختار مكانَ الشراء الأصليّ.
   *
   * والقاعدةُ الواحدة تُسقط الاثنين: كلُّ طلبٍ `PAID` مالٌ دخل، والفاتورةُ مستندٌ لا مال.
   * والمستردُّ `REFUNDED` خارجٌ من تلقائه.
   */
  /**
   * **نفسُ شرط صفحة الطلبات** (`lib/orders/revenue-order.ts`) — فسهمُ «التفاصيل» من هناك لا
   * يوصل إلى رقمٍ آخر (خالد ٢٣ سبتمبر ٢٠٢٦). كان يقرأ طلباتِ العملاء المفعَّلين وحدهم، فطلبٌ
   * مدفوعٌ ينتظر التفعيل (مالٌ دخل) يُعدّ هناك ويسقط هنا.
   *
   * والحسابُ الداخليّ يُستثنى من الجهتين: وسمُ الطلب، ووسمُ العميل — الترحيلُ كتب طلباتِ
   * حساباتنا `isInternal: false` وعملاؤها داخليّون.
   */
  const paidOrders = await db.checkoutOrder.findMany({
    where: {
      AND: [
        REVENUE_ORDER,
        { totalMinor: { gt: 0 } },
        { OR: [{ clientId: { in: clientIds } }, { clientId: null }, { clientId: { isSet: false } }] },
      ],
    },
    select: { clientId: true, salesRepId: true, currency: true, totalMinor: true, paidAt: true, serviceStartedAt: true, createdAt: true, planName: true },
  });
  /** يومُ الدفع إن وُجد، وإلّا يومُ بدء الخدمة — لا يومُ إنشاء الصفّ. */
  const orderDate = (o: (typeof paidOrders)[number]) => o.paidAt ?? o.serviceStartedAt ?? o.createdAt;

  const { start, end } = periodBounds(period);
  // Whether a contribution's date falls in the active period (whole-book = always).
  const inPeriod = (d: Date | null | undefined): boolean => {
    if (!start || !end) return true;
    if (!d) return false;
    return d >= start && d < end;
  };

  const invoicesRaw = clientIds.length
    ? await db.invoice.findMany({
        where: { clientId: { in: clientIds } },
        select: {
          clientId: true,
          number: true,
          tierName: true,
          period: true,
          amount: true,
          totalMinor: true,
          currency: true,
          paymentStatus: true,
          issuedAt: true,
          paidAt: true,
          fromOpeningBalance: true,
          orderId: true,
          paidMonths: true,
          bonusServiceMonths: true,
          archivedAt: true,
        },
        orderBy: { issuedAt: "desc" },
        take: 5000,
      })
    : [];
  // Archived (void) invoices are excluded in code, NOT in the where — a Prisma/Mongo
  // `{archivedAt: null}` filter matches zero rows and would empty the whole report.
  const invoices = invoicesRaw.filter((inv) => !inv.archivedAt);
  /**
   * مدّةُ كلّ فاتورة من **طلبها** (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد). كانت «سنوي» لكلّ مدّةٍ غيرِ
   * شهر: `Invoice.period` يُكتب `annual` لطلب ٣ أو ٦ أشهر (`plan-invoice-from-order.ts`).
   */
  const termOrderIds = [...new Set(invoices.map((inv) => inv.orderId).filter((id): id is string => !!id))];
  const termByOrder = new Map(
    (termOrderIds.length
      ? await db.checkoutOrder.findMany({ where: { id: { in: termOrderIds } }, select: { id: true, paidMonths: true, bonusServiceMonths: true } })
      : []
    ).map((o) => [o.id, o]),
  );
  const invoiceTerm = (inv: (typeof invoices)[number]): string => {
    const order = inv.orderId ? termByOrder.get(inv.orderId) : undefined;
    if (order) return formatTermLabel(order.paidMonths, order.bonusServiceMonths);
    // فاتورةٌ بلا طلب (قديمة) — مدّتُها المحفوظةُ عليها إن وُجدت، وإلّا لا نخمّن.
    return inv.paidMonths ? formatTermLabel(inv.paidMonths, inv.bonusServiceMonths) : "—";
  };

  const totals = { sar: emptyMoney(), egp: emptyMoney() };
  const tierMap = new Map<string, { sar: Money; egp: Money }>();
  const repMap = new Map<string, { sar: Money; egp: Money }>();
  /**
   * عددُ الصفقات لكلّ باقةٍ ومندوب — مفتاحُ الترتيب (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد). كان
   * الترتيبُ يجمع الريالَ على الجنيه رقماً واحداً، فمندوبٌ بـ٢٠٬٠٠٠ ج.م. يسبق مندوباً بـ١٠٬٠٠٠ ر.س.
   * والعددُ لا عملةَ له؛ وعند التعادل تُقارَن كلُّ عملةٍ وحدها.
   */
  const tierDeals = new Map<string, number>();
  const repDeals = new Map<string, number>();
  const payingClients = new Set<string>();

  const ensure = (map: Map<string, { sar: Money; egp: Money }>, key: string) => {
    let v = map.get(key);
    if (!v) {
      v = { sar: emptyMoney(), egp: emptyMoney() };
      map.set(key, v);
    }
    return v;
  };

  // Fan a collected/outstanding amount into totals + its tier + its rep, in one currency.
  const fan = (
    isEgp: boolean,
    tierName: string,
    repId: string | null | undefined,
    amount: number,
    paid: boolean,
    isInvoice: boolean
  ) => {
    const apply = (m: Money) => {
      if (paid) m.paid += amount;
      else m.due += amount;
      if (isInvoice) m.invoices += 1;
    };
    apply(isEgp ? totals.egp : totals.sar);
    const tierKey = tierName || "—";
    const tier = ensure(tierMap, tierKey);
    apply(isEgp ? tier.egp : tier.sar);
    // صفقةٌ = طلبٌ مدفوع، أو فاتورةٌ مستحقّة للباقة — المدفوعةُ مستندٌ لطلبٍ عُدّ.
    const isDeal = paid ? !isInvoice : true;
    if (isDeal) tierDeals.set(tierKey, (tierDeals.get(tierKey) ?? 0) + 1);
    if (repId) {
      const rep = ensure(repMap, repId);
      apply(isEgp ? rep.egp : rep.sar);
      if (paid && !isInvoice) repDeals.set(repId, (repDeals.get(repId) ?? 0) + 1);
    }
  };
  /** العددُ أوّلاً، ثمّ الجنيهُ وحده، ثمّ الريالُ وحده — لا جمعَ بين عملتين أبداً. */
  const byDealsThenCurrency =
    <T extends { sar: Money; egp: Money }>(deals: Map<string, number>, key: (r: T) => string) =>
    (x: T, y: T) =>
      (deals.get(key(y)) ?? 0) - (deals.get(key(x)) ?? 0) || y.egp.paid - x.egp.paid || y.sar.paid - x.sar.paid;

  // 1) الطلباتُ المدفوعة — بعملتها وتاريخِ دفعها وباقتِها كما بيعت.
  for (const order of paidOrders) {
    if (!inPeriod(orderDate(order))) continue;
    // بلا حساب = مدفوعٌ ينتظر التفعيل: مالُه يُعدّ، ولا يُعدّ «عميلاً دافعاً» قبل أن يُفتح له حساب.
    const client = order.clientId ? clientById.get(order.clientId) : undefined;
    if (client) payingClients.add(client.id);
    // المندوبُ صاحبُ الصفقة من الطلب، لا مَن يتابع العميلَ اليوم.
    fan(order.currency === "EGP", order.planName || "بلا باقة", order.salesRepId ?? client?.salesRepId, order.totalMinor / 100, true, false);
  }

  /**
   * 2) الفواتير — المدفوعةُ مستندٌ لطلبٍ يحمل مالَها: تُعدّ فاتورةً بلا مبلغ. وغيرُ المدفوعة دَينٌ
   *    «مستحقّ» في شهر إصدارها — لا يدخل المحصَّل.
   *
   * المستحقّ بقاعدة كشف الحساب نفسِها (`isOutstandingInvoice` + `invoiceMinor`) — ٢٣ سبتمبر ٢٠٢٦
   * · خالد: مصدرٌ واحد. كان هنا تعريفٌ ثالث: يُسقط فواتيرَ الرصيد الافتتاحيّ غيرَ المدفوعة ويقرأ
   * `amount` العشريّ، فلا يساوي «المستحق» هنا مجموعَ «المستحق» في كشوف العملاء. ومستندُ الرصيد
   * الافتتاحيّ **المدفوع** وحده يُتخطّى: لا مالَ فيه ولا فاتورةَ جديدة.
   */
  for (const inv of invoices) {
    const outstanding = isOutstandingInvoice(inv);
    if (inv.fromOpeningBalance && !outstanding) continue;
    const when = outstanding ? inv.issuedAt : inv.paidAt ?? inv.issuedAt;
    if (!inPeriod(when)) continue;
    const isEgp = inv.currency === "EGP";
    const repId = clientById.get(inv.clientId)?.salesRepId;
    fan(isEgp, inv.tierName || "—", repId, outstanding ? invoiceMinor(inv) / 100 : 0, !outstanding, true);
  }

  // Rep rows — every client with a rep (even 0-invoice ones), name + client count.
  const clientCountByRep = new Map<string, number>();
  for (const c of clients) {
    if (c.salesRepId) clientCountByRep.set(c.salesRepId, (clientCountByRep.get(c.salesRepId) ?? 0) + 1);
  }
  const repIds = [...clientCountByRep.keys()];
  const staff = repIds.length
    ? await db.staff.findMany({ where: { id: { in: repIds } }, select: { id: true, name: true, email: true } })
    : [];
  const repName = new Map(staff.map((s) => [s.id, s.name || s.email || "مندوب"]));

  const reps: SalesRepRow[] = repIds
    .map((id) => {
      const a = repMap.get(id) ?? { sar: emptyMoney(), egp: emptyMoney() };
      return {
        id,
        name: repName.get(id) ?? "مندوب",
        clientCount: clientCountByRep.get(id) ?? 0,
        sar: a.sar,
        egp: a.egp,
      };
    })
    .sort(byDealsThenCurrency<SalesRepRow>(repDeals, (r) => r.id));

  const byTier: TierRow[] = [...tierMap.entries()]
    .map(([tierName, v]) => ({ tierName, sar: v.sar, egp: v.egp }))
    .sort(byDealsThenCurrency<TierRow>(tierDeals, (r) => r.tierName));

  // Invoices for the active period — the report's table (sort/search/paginate client-side).
  // Opening-balance documents ARE shown (they were issued and belong in the ledger view) but
  // tagged so it's clear they don't add new revenue — no invoice adds to «collected»; an
  // unpaid one (opening balance included) adds to «due» by `isOutstandingInvoice` above.
  // A paid invoice belongs to its collection month (paidAt); a due one to its issue month.
  const recent: RecentInvoice[] = invoices
    .filter((inv) => inPeriod(inv.paymentStatus === InvoicePaymentStatus.PAID ? inv.paidAt ?? inv.issuedAt : inv.issuedAt))
    .map((inv) => {
      const when = inv.paidAt ?? inv.issuedAt;
      return {
        id: inv.number,
        number: inv.number,
        clientName: clientById.get(inv.clientId)?.name ?? "—",
        tierName: inv.tierName || "—",
        term: invoiceTerm(inv),
        // نفسُ مبلغ المستحقّ أعلاه (`invoiceMinor`): `totalMinor` أوّلاً، و`amount` للقديمة.
        amount: invoiceMinor(inv) / 100,
        currency: inv.currency,
        paid: inv.paymentStatus === InvoicePaymentStatus.PAID,
        status: inv.paymentStatus,
        issuedAt: dateFmt.format(when),
        dateMs: when.getTime(),
        fromOpeningBalance: !!inv.fromOpeningBalance,
      };
    });

  const unassignedCount = await db.client.count({
    where: { AND: [NOT_INTERNAL, { OR: [{ salesRepId: null }, { salesRepId: { isSet: false } }] }] },
  });

  // «منتهٍ» — نفسُ قاعدة شريحة «expired» وعدّاد العملاء: من الطلب الساري لا من نسخة الكرت
  // (٢٣ سبتمبر ٢٠٢٦). كان `ACTIVE` + `subscriptionEndDate < الآن` على الكرت.
  const expiredCount = clientIdsWhere(await getClientSubscriptions(NOT_INTERNAL), (x) => x.status === "EXPIRED").length;

  // Monthly collected badges — cash in per month of the CURRENT year (PAID orders by paidAt
  // only; invoices are documents), independent of the active filter so every button
  // shows its month's size at a glance.
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);
  const monthlyTotals: MonthTotal[] = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, sar: 0, egp: 0 }));
  const yearTotal = { sar: 0, egp: 0 };
  const addMonthly = (when: Date, isEgp: boolean, amount: number) => {
    if (when < yearStart || when >= yearEnd) return;
    const bucket = monthlyTotals[when.getMonth()];
    if (isEgp) {
      bucket.egp += amount;
      yearTotal.egp += amount;
    } else {
      bucket.sar += amount;
      yearTotal.sar += amount;
    }
  };
  for (const order of paidOrders) {
    addMonthly(orderDate(order), order.currency === "EGP", order.totalMinor / 100);
  }

  return {
    totals,
    // Every issued (non-archived) invoice — opening-balance documents included: they exist in
    // the ledger; a paid one carries no money (its migrated order does), an unpaid one is «due».
    invoiceCount: invoices.length,
    payingClients: payingClients.size,
    byTier,
    recent,
    reps,
    unassignedCount,
    repCount: repIds.length,
    assignedClientCount: clients.filter((c) => c.salesRepId).length,
    expiredCount,
    monthlyTotals,
    yearTotal,
  };
}
