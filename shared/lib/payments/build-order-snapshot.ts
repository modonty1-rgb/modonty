import type { SubscriptionTier } from "@prisma/client";

/**
 * Pure function: catalog inputs → the immutable price/plan snapshot stored on a
 * `CheckoutOrder` (PAY-B2 · PAY-AV-SNAPSHOT). No database access here, so it can be
 * exercised with plain numbers and its arithmetic cannot drift from the invoice.
 *
 * Money is Int in MINOR units. The catalog price is VAT-inclusive (PAY-Q7):
 *   total    = monthlyBase × paidMonths
 *   vat      = total − round(total ÷ (1 + rate))
 *   subtotal = total − vat
 */
export interface OrderSnapshotInput {
  plan: { id: string; slug: string; name: string; tier: SubscriptionTier | null; articlesPerMonth: number | null };
  price: { market: string; currency: string; monthlyBase: number }; // major units, as stored in the catalog
  term: { paidMonths: number; bonusServiceMonths: number };
  vatRateBp: number;
}

export interface OrderSnapshot {
  market: string;
  currency: string;
  planId: string;
  planSlug: string;
  planName: string;
  planTier: SubscriptionTier | null;
  articlesPerMonth: number | null;
  monthlyBaseMinor: number;
  paidMonths: number;
  bonusServiceMonths: number;
  subtotalMinor: number;
  vatRateBp: number;
  vatMinor: number;
  totalMinor: number;
}

const MINOR_PER_MAJOR = 100; // halala / piastre

export function buildOrderSnapshot({ plan, price, term, vatRateBp }: OrderSnapshotInput): OrderSnapshot {
  if (!Number.isInteger(price.monthlyBase) || price.monthlyBase < 0) throw new Error("monthlyBase must be a non-negative integer");
  if (!Number.isInteger(term.paidMonths) || term.paidMonths < 1) throw new Error("paidMonths must be a positive integer");
  if (!Number.isInteger(term.bonusServiceMonths) || term.bonusServiceMonths < 0) throw new Error("bonusServiceMonths must be a non-negative integer");
  if (!Number.isInteger(vatRateBp) || vatRateBp < 0) throw new Error("vatRateBp must be a non-negative integer");

  const monthlyBaseMinor = price.monthlyBase * MINOR_PER_MAJOR;
  const totalMinor = monthlyBaseMinor * term.paidMonths;
  const subtotalMinor = Math.round((totalMinor * 10_000) / (10_000 + vatRateBp));
  const vatMinor = totalMinor - subtotalMinor;

  return {
    market: price.market,
    currency: price.currency,
    planId: plan.id,
    planSlug: plan.slug,
    planName: plan.name,
    planTier: plan.tier,
    articlesPerMonth: plan.articlesPerMonth,
    monthlyBaseMinor,
    paidMonths: term.paidMonths,
    bonusServiceMonths: term.bonusServiceMonths,
    subtotalMinor,
    vatRateBp,
    vatMinor,
    totalMinor,
  };
}
