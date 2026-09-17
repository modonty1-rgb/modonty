import { db } from "@/lib/db";

/**
 * Which order governs this client right now.
 *
 * The pointer lives on the CLIENT (`Client.activeOrderId`), not as a flag on the order:
 * one field cannot hold two values, whereas a "current" flag on the order can end up on
 * two rows at once and nothing in Mongo prevents it (MONEY-FLOW §4).
 *
 * `resolveActiveOrderId` is the fallback for every client linked before the pointer
 * existed: the most recent PAID order the client owns. It is deliberately NOT a general
 * "latest order" — an unpaid or failed attempt must never govern a client.
 */
export async function resolveActiveOrderId(clientId: string): Promise<string | null> {
  const latestPaid = await db.checkoutOrder.findFirst({
    where: { clientId, status: "PAID" },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    select: { id: true },
  });
  return latestPaid?.id ?? null;
}

/**
 * Move the pointer to `orderId`, or recompute it when called without one.
 *
 * Called on every event that changes which deal is current: linking an order to a client,
 * confirming a payment, and (later) a renewal. Safe to call repeatedly — writing the same
 * id twice changes nothing.
 */
export async function setActiveOrder(clientId: string, orderId?: string): Promise<string | null> {
  const next = orderId ?? (await resolveActiveOrderId(clientId));
  await db.client.update({ where: { id: clientId }, data: { activeOrderId: next } });
  return next;
}

export type ActiveOrderSummary = {
  id: string;
  number: string;
  status: string;
  planName: string;
  currency: string;
  totalMinor: number;
  paidMonths: number;
  bonusServiceMonths: number;
  paidAt: Date | null;
  serviceStartedAt: Date | null;
  salesRepName: string | null;
  /** True when the pointer was missing and this was derived from the client's paid orders. */
  derived: boolean;
};

/**
 * The client's governing order, ready to render.
 *
 * Reads the pointer first and falls back to the latest paid order, so the card is correct
 * for the 39 clients that predate the pointer without waiting for a backfill. When the
 * fallback fires it also PERSISTS the pointer, so the page heals the data it reads.
 */
export async function getActiveOrderForClient(clientId: string): Promise<ActiveOrderSummary | null> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { activeOrderId: true },
  });
  if (!client) return null;

  let orderId = client.activeOrderId;
  let derived = false;

  if (!orderId) {
    orderId = await resolveActiveOrderId(clientId);
    if (!orderId) return null;
    derived = true;
    // Heal on read: the next visit takes the fast path.
    await db.client.update({ where: { id: clientId }, data: { activeOrderId: orderId } });
  }

  const order = await db.checkoutOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true, number: true, status: true, planName: true, currency: true,
      totalMinor: true, paidMonths: true, bonusServiceMonths: true,
      paidAt: true, serviceStartedAt: true, salesRepId: true, clientId: true,
    },
  });

  // A pointer to a deleted or re-linked order must not render as this client's deal.
  if (!order || (order.clientId && order.clientId !== clientId)) return null;

  const rep = order.salesRepId
    ? await db.staff.findUnique({ where: { id: order.salesRepId }, select: { name: true, email: true } })
    : null;

  return {
    id: order.id,
    number: order.number,
    status: order.status,
    planName: order.planName,
    currency: order.currency,
    totalMinor: order.totalMinor,
    paidMonths: order.paidMonths,
    bonusServiceMonths: order.bonusServiceMonths,
    paidAt: order.paidAt,
    serviceStartedAt: order.serviceStartedAt,
    salesRepName: rep?.name || rep?.email || null,
    derived,
  };
}

export type ClientOrderRow = {
  id: string;
  number: string;
  status: string;
  planName: string;
  currency: string;
  totalMinor: number;
  paidMonths: number;
  bonusServiceMonths: number;
  paidAt: Date | null;
  createdAt: Date;
  isActive: boolean;
};

/** Every order the client owns, newest first — their money history in one list. */
export async function getClientOrders(clientId: string, activeOrderId: string | null): Promise<ClientOrderRow[]> {
  const orders = await db.checkoutOrder.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, number: true, status: true, planName: true, currency: true,
      totalMinor: true, paidMonths: true, bonusServiceMonths: true, paidAt: true, createdAt: true,
    },
  });
  return orders.map((o) => ({ ...o, isActive: o.id === activeOrderId }));
}
