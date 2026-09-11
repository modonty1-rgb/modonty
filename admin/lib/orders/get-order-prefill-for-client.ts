"use server";

import { db } from "@/lib/db";

/**
 * Read-only prefill for /clients/new?orderId=… (PAY-E3) — only the fields the card names:
 * name/email/phone/country from the buyer snapshot, tier from the plan snapshot. Returns
 * null when the order can't found a client from yet (not PAID, or already linked) so the
 * caller falls back to a plain, unprefilled create form instead of a wrong silent state.
 *
 * `planName` travels alongside `subscriptionTier` on purpose (measured live, PAY-E3):
 * `CommercialPlan.tier` (the checkout catalog, PAY-A2) and `SubscriptionTierConfig.tier`
 * (the older admin client catalog this form reads) do NOT share one enum mapping —
 * "الانطلاقة" is CommercialPlan.tier=BASIC but SubscriptionTierConfig.tier=STANDARD;
 * SubscriptionTierConfig's own BASIC is a different, unrelated tier named "مجاني" (free).
 * Trusting the enum alone would silently prefill a paid client onto the free tier. Same
 * class of mismatch PAY-A11 tracks for the /pay side; the form matches by NAME first.
 *
 * Lives under admin/lib (not orders/actions.ts) because it is called by both the orders
 * route (the "إنشاء حساب العميل" link) and the clients route (/clients/new reading it) —
 * two sibling routes may not import each other's actions.ts directly.
 */
export async function getOrderPrefillForClient(orderId: string): Promise<{
  orderId: string;
  name: string;
  email: string;
  phone: string;
  addressCountry: string | null;
  subscriptionTier: string | null;
  planName: string;
  billingCycle: "monthly" | "annual";
  /** The amount actually paid (major units) — the founding opening balance. Fable
   *  (11 Sep): the generic tier-catalog auto-calc the form otherwise runs can miss or
   *  drift from what this specific order charged; an order's own total is authoritative. */
  openingBalance: number;
} | null> {
  const order = await db.checkoutOrder.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, clientId: true, buyerName: true, buyerEmail: true, buyerPhone: true, businessName: true, country: true, planTier: true, planName: true, paidMonths: true, totalMinor: true },
  });
  if (!order || order.status !== "PAID" || order.clientId) return null;
  return {
    orderId: order.id,
    name: order.businessName || order.buyerName,
    email: order.buyerEmail,
    phone: order.buyerPhone,
    addressCountry: order.country,
    subscriptionTier: order.planTier,
    planName: order.planName,
    billingCycle: order.paidMonths === 1 ? "monthly" : "annual",
    openingBalance: order.totalMinor / 100,
  };
}
