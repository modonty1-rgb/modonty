import { db } from "@/lib/db";

export type DealKind = "new" | "renewal";

export interface CommissionRateRow {
  id: string;
  newRateBp: number;
  renewalRateBp: number;
  effectiveFrom: Date;
}

export interface CommissionDeal {
  orderId: string;
  number: string;
  clientName: string;
  soldOn: Date;
  currency: string;
  /** Before VAT — `CheckoutOrder.subtotalMinor` (Khalid: «قبل الضريبة»). */
  baseMinor: number;
  kind: DealKind;
  refunded: boolean;
  /** The rate in force on `soldOn`; null while the rep has no rate at all. */
  rateBp: number | null;
  /** 0 for a refunded deal — its commission falls away (Khalid: «تنشال»). */
  commissionMinor: number;
  /**
   * Where the deal stands against the payouts:
   * - `unpaid`   — paid by the client, its commission not paid out yet (selectable for a payout);
   * - `settled`  — its commission went out in a payout;
   * - `clawback` — paid out, then refunded: `clawbackMinor` is owed back (a minus line, selectable);
   * - `none`     — nothing to pay: refunded before any payout, or no rate / zero commission.
   */
  state: "unpaid" | "settled" | "clawback" | "none";
  /** What was paid out for this order (item snapshots, net). */
  paidMinor: number;
  /** For `clawback`: the amount to take back (positive number). */
  clawbackMinor: number;
}

export interface CurrencyTotals {
  currency: string;
  /** Collected sales before VAT (refunds excluded). */
  salesMinor: number;
  /** Commission of the orders still unpaid. */
  unpaidMinor: number;
  /** Commission to take back: paid out, then refunded. */
  clawbackMinor: number;
  /** What is owed now = unpaid − clawback. Negative only if clawbacks exceed what is unpaid. */
  owedMinor: number;
  /** Everything paid out in this currency so far. */
  paidOutMinor: number;
}

export interface RepCommission {
  id: string;
  name: string;
  isActive: boolean;
  rates: CommissionRateRow[];
  currentRate: CommissionRateRow | null;
  totals: CurrencyTotals[];
  deals: CommissionDeal[];
  payouts: { id: string; currency: string; amountMinor: number; paidOn: Date; note: string | null; items: { orderId: string; orderNumber: string; commissionMinor: number }[] }[];
  newCount: number;
  renewalCount: number;
  refundedCount: number;
}

/** The day a deal counts from: payment, else the manual confirmation, the transfer, the order. */
function soldOnOf(o: { paidAt: Date | null; confirmedAt: Date | null; transferDate: Date | null; createdAt: Date }): Date {
  return o.paidAt ?? o.confirmedAt ?? o.transferDate ?? o.createdAt;
}

/** The rate in force on `day`; a deal older than the first rate takes the first rate. */
function rateOn(rates: CommissionRateRow[], day: Date): CommissionRateRow | null {
  if (!rates.length) return null;
  let found = rates[0];
  for (const r of rates) if (r.effectiveFrom <= day) found = r;
  return found;
}

/**
 * Shared by the commissions page (pay out) and the orders list (the face beside each order that
 * says whether its rep's commission went out).
 *
 * Every sales rep's commission ledger — computed from the orders themselves, never stored.
 *
 * Source of truth is the order (`shared/lib/payments/collected.ts`): `PAID` is money in,
 * `REFUNDED` is money that went back. A deal is the rep named on the order
 * (`CheckoutOrder.salesRepId` — the order, not the client, because a renewal can be sold by
 * someone else). «New» = the client's first collected order; every later one is a renewal.
 * Internal orders (our own accounts) are not sales and are skipped.
 */
export async function getSalesCommissions(): Promise<RepCommission[]> {
  const [orders, reps, rates, payouts] = await Promise.all([
    db.checkoutOrder.findMany({
      where: { status: { in: ["PAID", "REFUNDED"] }, isInternal: { not: true } },
      select: {
        id: true, number: true, status: true, currency: true, subtotalMinor: true, salesRepId: true,
        clientId: true, buyerEmail: true, buyerName: true, businessName: true,
        paidAt: true, confirmedAt: true, transferDate: true, createdAt: true,
      },
    }),
    db.staff.findMany({ where: { role: "SALES" }, select: { id: true, name: true, isActive: true } }),
    db.salesCommissionRate.findMany({ orderBy: { effectiveFrom: "asc" }, select: { id: true, staffId: true, newRateBp: true, renewalRateBp: true, effectiveFrom: true } }),
    db.salesCommissionPayout.findMany({
      orderBy: [{ paidOn: "desc" }, { createdAt: "desc" }],
      select: { id: true, staffId: true, currency: true, amountMinor: true, paidOn: true, note: true, items: true },
    }),
  ]);

  const clientIds = [...new Set(orders.map((o) => o.clientId).filter((id): id is string => !!id))];
  const clients = clientIds.length ? await db.client.findMany({ where: { id: { in: clientIds } }, select: { id: true, name: true } }) : [];
  const clientName = new Map(clients.map((c) => [c.id, c.name.trim()]));

  // Whose client an order is. A renewal is paid BEFORE it is linked to the existing account
  // («ربط بالعميل القائم», lib/orders/link-order-to-client.ts), so for a while it has no
  // clientId — matched by the buyer's email to the account his earlier orders are linked to,
  // or it would count as a «new» deal at the higher rate until someone links it.
  const clientByEmail = new Map<string, string>();
  for (const o of orders) if (o.clientId) clientByEmail.set(o.buyerEmail.trim().toLowerCase(), o.clientId);
  const clientKeyOf = (o: { clientId: string | null; buyerEmail: string }) => {
    const email = o.buyerEmail.trim().toLowerCase();
    return o.clientId ?? clientByEmail.get(email) ?? `email:${email}`;
  };

  // The client's first PAID order is «new»; every later one is a renewal. A refunded order does
  // not open the account — money that went back is no deal — so a client whose first order was
  // refunded is «new» again on his next paid one (Khalid, 30 Sep 2026). A refunded order is
  // itself labelled by the same rule (renewal only if a paid order came before it); its
  // commission is 0 either way.
  const firstOrderOf = new Map<string, { id: string; at: Date }>();
  for (const o of orders) {
    if (o.status !== "PAID") continue;
    const key = clientKeyOf(o);
    const at = soldOnOf(o);
    const cur = firstOrderOf.get(key);
    if (!cur || at < cur.at) firstOrderOf.set(key, { id: o.id, at });
  }

  // Reps: every SALES staff member, plus anyone named on an order or holding a rate/payout.
  const repIds = new Set<string>(reps.map((r) => r.id));
  for (const o of orders) if (o.salesRepId) repIds.add(o.salesRepId);
  for (const r of rates) repIds.add(r.staffId);
  for (const p of payouts) repIds.add(p.staffId);
  const extra = [...repIds].filter((id) => !reps.some((r) => r.id === id));
  const others = extra.length ? await db.staff.findMany({ where: { id: { in: extra } }, select: { id: true, name: true, isActive: true } }) : [];
  const staff = [...reps, ...others];

  const result: RepCommission[] = staff.map((s) => {
    const myRates: CommissionRateRow[] = rates.filter((r) => r.staffId === s.id);
    const myPayouts = payouts.filter((p) => p.staffId === s.id);
    // Net amount paid out per order across this rep's payouts (a clawback item is negative).
    const paidByOrder = new Map<string, number>();
    for (const p of myPayouts) for (const it of p.items) paidByOrder.set(it.orderId, (paidByOrder.get(it.orderId) ?? 0) + it.commissionMinor);
    const deals: CommissionDeal[] = orders
      .filter((o) => o.salesRepId === s.id)
      .map((o) => {
        const soldOn = soldOnOf(o);
        const first = firstOrderOf.get(clientKeyOf(o));
        const kind: DealKind =
          o.status === "PAID" ? (first?.id === o.id ? "new" : "renewal") : first && first.at < soldOn ? "renewal" : "new";
        const rate = rateOn(myRates, soldOn);
        const rateBp = rate ? (kind === "new" ? rate.newRateBp : rate.renewalRateBp) : null;
        const refunded = o.status === "REFUNDED";
        const commissionMinor = refunded || rateBp === null ? 0 : Math.round((o.subtotalMinor * rateBp) / 10_000);
        const paidMinor = paidByOrder.get(o.id) ?? 0;
        const state: CommissionDeal["state"] = refunded
          ? paidMinor > 0 ? "clawback" : "none"
          : paidMinor > 0 ? "settled" : commissionMinor > 0 ? "unpaid" : "none";
        return {
          orderId: o.id,
          number: o.number,
          clientName: (o.clientId && clientName.get(o.clientId)) || o.businessName?.trim() || o.buyerName.trim(),
          soldOn,
          currency: o.currency,
          baseMinor: o.subtotalMinor,
          kind,
          refunded,
          rateBp,
          commissionMinor,
          state,
          paidMinor,
          clawbackMinor: state === "clawback" ? paidMinor : 0,
        };
      })
      .sort((a, b) => b.soldOn.getTime() - a.soldOn.getTime());

    const currencies = [...new Set([...deals.map((d) => d.currency), ...myPayouts.map((p) => p.currency)])].sort();
    const totals: CurrencyTotals[] = currencies.map((currency) => {
      const inCur = deals.filter((d) => d.currency === currency);
      const unpaidMinor = inCur.filter((d) => d.state === "unpaid").reduce((sum, d) => sum + d.commissionMinor, 0);
      const clawbackMinor = inCur.reduce((sum, d) => sum + d.clawbackMinor, 0);
      return {
        currency,
        salesMinor: inCur.filter((d) => !d.refunded).reduce((sum, d) => sum + d.baseMinor, 0),
        unpaidMinor,
        clawbackMinor,
        owedMinor: unpaidMinor - clawbackMinor,
        paidOutMinor: myPayouts.filter((p) => p.currency === currency).reduce((sum, p) => sum + p.amountMinor, 0),
      };
    });

    return {
      id: s.id,
      name: s.name?.trim() || "—",
      isActive: s.isActive !== false,
      rates: myRates,
      currentRate: rateOn(myRates, new Date()),
      totals,
      deals,
      payouts: myPayouts.map(({ staffId: _staffId, ...p }) => ({ ...p, items: p.items.map((i) => ({ orderId: i.orderId, orderNumber: i.orderNumber, commissionMinor: i.commissionMinor })) })),
      newCount: deals.filter((d) => d.kind === "new" && !d.refunded).length,
      renewalCount: deals.filter((d) => d.kind === "renewal" && !d.refunded).length,
      refundedCount: deals.filter((d) => d.refunded).length,
    };
  });

  // Inactive reps only when they still have something on the books.
  return result
    .filter((r) => r.isActive || r.deals.length > 0 || r.payouts.length > 0)
    .sort((a, b) => b.deals.length - a.deals.length || a.name.localeCompare(b.name, "ar"));
}
