export type OrderKind = "new" | "renewal";

export interface OrderKindInput {
  id: string;
  status: string;
  clientId: string | null;
  buyerEmail: string;
  paidAt: Date | null;
  confirmedAt: Date | null;
  transferDate: Date | null;
  createdAt: Date;
}

/** The day a deal counts from: payment, else the manual confirmation, the transfer, the order. */
export function soldOnOf(o: { paidAt: Date | null; confirmedAt: Date | null; transferDate: Date | null; createdAt: Date }): Date {
  return o.paidAt ?? o.confirmedAt ?? o.transferDate ?? o.createdAt;
}

/**
 * **New or renewal — one rule for the commission and for the orders filter** (Khalid, 1 Oct 2026:
 * «نفصل مشترك جديد وتجديد الاشتراك»). Derived from the orders, never stored: the client stays one
 * account with many orders, and which of them opened it is a fact of their dates.
 *
 * - The client's first PAID order is «new»; every later one is a renewal. A refunded order does
 *   not open the account — money that went back is no deal — so a client whose first order was
 *   refunded is «new» again on his next paid one (Khalid, 30 Sep 2026).
 * - Any other order (refunded, awaiting payment…) is a renewal only if a paid order came before it.
 * - An order not linked to an account yet is matched to one by the buyer's email, or a renewal
 *   paid before activation would read «new».
 *
 * Pass every order that can decide a client's first one (at least all PAID ones), or a later
 * order is taken for the first.
 */
export function classifyOrderKinds(orders: OrderKindInput[]): Map<string, OrderKind> {
  const clientByEmail = new Map<string, string>();
  for (const o of orders) if (o.clientId) clientByEmail.set(o.buyerEmail.trim().toLowerCase(), o.clientId);
  const clientKeyOf = (o: OrderKindInput) => {
    const email = o.buyerEmail.trim().toLowerCase();
    return o.clientId ?? clientByEmail.get(email) ?? `email:${email}`;
  };

  const firstOrderOf = new Map<string, { id: string; at: Date }>();
  for (const o of orders) {
    if (o.status !== "PAID") continue;
    const key = clientKeyOf(o);
    const at = soldOnOf(o);
    const cur = firstOrderOf.get(key);
    if (!cur || at < cur.at) firstOrderOf.set(key, { id: o.id, at });
  }

  const kinds = new Map<string, OrderKind>();
  for (const o of orders) {
    const first = firstOrderOf.get(clientKeyOf(o));
    kinds.set(o.id, o.status === "PAID" ? (first?.id === o.id ? "new" : "renewal") : first && first.at < soldOnOf(o) ? "renewal" : "new");
  }
  return kinds;
}
