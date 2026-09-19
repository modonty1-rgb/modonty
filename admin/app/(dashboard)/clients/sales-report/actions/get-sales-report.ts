import { SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { NOT_INTERNAL } from "../../segment/segments";

/** "all" for the whole book, or a month number 1–12 (of the current year). */
export type Period = "all" | number;

export interface Money {
  /** Collected — real cash in (paid invoices + opening balances). */
  paid: number;
  /** Outstanding — raised but not yet collected (DUE invoices). NOT sales. */
  due: number;
  /** Count of real invoices contributing (opening balances are not invoices). */
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
  /** Billing type — "monthly" | "annual". */
  subType: string;
  amount: number;
  currency: string;
  paid: boolean;
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

const dateFmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" });

/**
 * Sales / revenue report for the whole book, on a CASH basis (Khalid 2026-07-25).
 *
 * «تأسيسه معناه دفع»: a client pays at founding. That payment now lives on the client's
 * FIRST paid order — `totalMinor` with its own `currency` and `paidAt` — not on
 * `Client.openingBalance`, which was a bare number dated at the client's createdAt and
 * whose currency had to be guessed from the address (١٧ سبتمبر ٢٠٢٦).
 *
 * An invoice generated FROM that balance is flagged `fromOpeningBalance` — a document,
 * not new money, so it is EXCLUDED here to avoid double-counting.
 *
 * Collected (المحصّل) = founding orders (by paidAt) + PAID invoices (by paidAt).
 * Outstanding (المستحق, DUE) is shown separately — it is a receivable, never counted as sales.
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
   * -- الإيرادُ التأسيسيّ يُقرأ من الطلب، لا من `Client.openingBalance` --
   *
   * كان رقماً على الكرت مؤرَّخاً بيوم إنشاء العميل — وكلاهما تقريب: المبلغُ لا عملةَ
   * معه (تُشتقّ من البلد)، والتاريخُ يومُ فتح الملفّ لا يومُ الدفع. وصار لكلّ عميلٍ
   * طلبٌ يحمل الاثنين صريحين: `currency` و`paidAt`.
   *
   * وقيس التطابقُ قبل التبديل (١٧ سبتمبر ٢٠٢٦): مجموعُ أرصدة عملاء مصر ١٠٤٬٣٣٥ =
   * مجموعُ طلباتهم ١٠٤٬٣٣٥ — نفسُ الرقم، بمصدرٍ يعرف عملتَه وتاريخَه.
   *
   * ويُؤخذ الطلبُ الأوّل لكلّ عميل (`serviceStartedAt` صعوداً): هو الشراءُ المؤسِّس،
   * وما بعده تجديداتٌ تأتي بفواتيرها.
   */
  const foundingOrders = await db.checkoutOrder.findMany({
    where: { clientId: { in: clientIds }, status: "PAID", totalMinor: { gt: 0 } },
    select: { clientId: true, currency: true, totalMinor: true, paidAt: true, serviceStartedAt: true, createdAt: true, planName: true },
    orderBy: [{ serviceStartedAt: "asc" }, { createdAt: "asc" }],
  });
  const foundingByClient = new Map<string, (typeof foundingOrders)[number]>();
  for (const o of foundingOrders) {
    if (o.clientId && !foundingByClient.has(o.clientId)) foundingByClient.set(o.clientId, o);
  }
  /** يومُ الدفع إن وُجد، وإلّا يومُ بدء الخدمة — لا يومُ إنشاء الصفّ. */
  const foundingDate = (o: (typeof foundingOrders)[number]) => o.paidAt ?? o.serviceStartedAt ?? o.createdAt;

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
          currency: true,
          paymentStatus: true,
          issuedAt: true,
          paidAt: true,
          fromOpeningBalance: true,
          archivedAt: true,
        },
        orderBy: { issuedAt: "desc" },
        take: 5000,
      })
    : [];
  // Archived (void) invoices are excluded in code, NOT in the where — a Prisma/Mongo
  // `{archivedAt: null}` filter matches zero rows and would empty the whole report.
  const invoices = invoicesRaw.filter((inv) => !inv.archivedAt);

  const totals = { sar: emptyMoney(), egp: emptyMoney() };
  const tierMap = new Map<string, { sar: Money; egp: Money }>();
  const repMap = new Map<string, { sar: Money; egp: Money }>();
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
    const tier = ensure(tierMap, tierName || "—");
    apply(isEgp ? tier.egp : tier.sar);
    if (repId) {
      const rep = ensure(repMap, repId);
      apply(isEgp ? rep.egp : rep.sar);
    }
  };

  // 1) الشراءُ المؤسِّس — من الطلب الأوّل، بعملته وتاريخِ دفعه. يُعدّ محصَّلاً دائماً.
  for (const c of clients) {
    const order = foundingByClient.get(c.id);
    if (!order) continue;
    if (!inPeriod(foundingDate(order))) continue;
    // العملةُ من الطلب نفسه لا من بلد العميل — الطلبُ يحملها صريحةً.
    const isEgp = order.currency === "EGP";
    // اسمُ الباقة من **الطلب المؤسِّس نفسه** لا من جدول الباقات القديم (١٩ سبتمبر ٢٠٢٦):
    // هذا السطرُ يعدّ إيرادَ ذلك الطلب، فاسمُ الباقة الصادق هو ما بيع فيه — لا ما صار
    // على كرت العميل بعد ترقيةٍ أو تجديد. والاسمُ الناقص يُقال ناقصاً.
    const tierName = order.planName || "بلا باقة";
    payingClients.add(c.id);
    fan(isEgp, tierName, c.salesRepId, order.totalMinor / 100, true, false);
  }

  // 2) Invoices — PAID counts as collected on its paidAt; DUE is outstanding on its issuedAt.
  //    fromOpeningBalance invoices only document the balance already counted above → skip.
  for (const inv of invoices) {
    if (inv.fromOpeningBalance) continue;
    const paid = inv.paymentStatus === "PAID";
    const when = paid ? inv.paidAt ?? inv.issuedAt : inv.issuedAt;
    if (!inPeriod(when)) continue;
    const isEgp = inv.currency === "EGP";
    if (paid) payingClients.add(inv.clientId);
    const repId = clientById.get(inv.clientId)?.salesRepId;
    fan(isEgp, inv.tierName || "—", repId, inv.amount, paid, true);
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
    .sort((x, y) => y.sar.paid + y.egp.paid - (x.sar.paid + x.egp.paid));

  const byTier: TierRow[] = [...tierMap.entries()]
    .map(([tierName, v]) => ({ tierName, sar: v.sar, egp: v.egp }))
    .sort((x, y) => y.sar.paid + y.egp.paid + y.sar.due + y.egp.due - (x.sar.paid + x.egp.paid + x.sar.due + x.egp.due));

  // Invoices for the active period — the report's table (sort/search/paginate client-side).
  // Opening-balance documents ARE shown (they were issued and belong in the ledger view) but
  // tagged so it's clear they don't add new revenue — the totals above already exclude them.
  // A paid invoice belongs to its collection month (paidAt); a due one to its issue month.
  const recent: RecentInvoice[] = invoices
    .filter((inv) => inPeriod(inv.paymentStatus === "PAID" ? inv.paidAt ?? inv.issuedAt : inv.issuedAt))
    .map((inv) => {
      const when = inv.paidAt ?? inv.issuedAt;
      return {
        id: inv.number,
        number: inv.number,
        clientName: clientById.get(inv.clientId)?.name ?? "—",
        tierName: inv.tierName || "—",
        subType: inv.period === "monthly" ? "monthly" : "annual",
        amount: inv.amount,
        currency: inv.currency,
        paid: inv.paymentStatus === "PAID",
        issuedAt: dateFmt.format(when),
        dateMs: when.getTime(),
        fromOpeningBalance: !!inv.fromOpeningBalance,
      };
    });

  const unassignedCount = await db.client.count({
    where: { AND: [NOT_INTERNAL, { OR: [{ salesRepId: null }, { salesRepId: { isSet: false } }] }] },
  });

  // Overdue renewals — same rule as the «expired» segment: an ACTIVE client whose paid
  // period already lapsed. `not: null` is required — on Mongo `{ lt: now }` also matches an
  // ABSENT date, which would drag in every client that never had an end date.
  const expiredCount = await db.client.count({
    where: {
      AND: [
        NOT_INTERNAL,
        { subscriptionStatus: SubscriptionStatus.ACTIVE, subscriptionEndDate: { lt: new Date(), not: null } },
      ],
    },
  });

  // Monthly collected badges — cash in per month of the CURRENT year (opening balances by
  // createdAt + paid invoices by paidAt), independent of the active filter so every button
  // shows its month's size at a glance. Archived + opening-balance documents excluded.
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
  for (const c of clients) {
    const order = foundingByClient.get(c.id);
    if (!order) continue;
    addMonthly(foundingDate(order), order.currency === "EGP", order.totalMinor / 100);
  }
  for (const inv of invoices) {
    if (inv.fromOpeningBalance) continue;
    if (inv.paymentStatus !== "PAID") continue;
    addMonthly(inv.paidAt ?? inv.issuedAt, inv.currency === "EGP", inv.amount);
  }

  return {
    totals,
    // Every issued (non-archived) invoice — opening-balance documents included: they exist in
    // the ledger even though their amount is counted via the opening balance, not here.
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
