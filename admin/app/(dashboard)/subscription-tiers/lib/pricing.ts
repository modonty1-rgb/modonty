// Shape of `pricing` JSON on SubscriptionTierConfig.
// mo = monthly cost · yr = monthly equivalent of annual plan
export interface PricePoint {
  mo: number;
  yr: number;
}

export interface TierPricing {
  SA: PricePoint;
  EG: PricePoint;
}

// Fallback constants — used when DB `pricing` is null (pre-sync).
// Source: JBRSEO landing-{sa,eg}.ts. If pricing changes, update here AND run sync-tier-pricing.ts.
export const FALLBACK_PRICING_BY_NAME: Record<string, TierPricing> = {
  "مجاني":     { SA: { mo: 0,    yr: 0    }, EG: { mo: 0,    yr: 0    } },
  "الانطلاقة": { SA: { mo: 499,  yr: 399  }, EG: { mo: 1499, yr: 1199 } },
  "الزخم":     { SA: { mo: 1299, yr: 1039 }, EG: { mo: 3999, yr: 3199 } },
  "الريادة":   { SA: { mo: 2999, yr: 2399 }, EG: { mo: 8999, yr: 7199 } },
};

export function resolvePricing(name: string, pricingFromDb: unknown): TierPricing {
  // Validate the DB shape — only use if it matches { SA: {mo,yr}, EG: {mo,yr} }
  if (
    pricingFromDb &&
    typeof pricingFromDb === "object" &&
    "SA" in pricingFromDb &&
    "EG" in pricingFromDb
  ) {
    const p = pricingFromDb as { SA: PricePoint; EG: PricePoint };
    if (
      typeof p.SA?.mo === "number" &&
      typeof p.SA?.yr === "number" &&
      typeof p.EG?.mo === "number" &&
      typeof p.EG?.yr === "number"
    ) {
      return p;
    }
  }
  return FALLBACK_PRICING_BY_NAME[name] ?? { SA: { mo: 0, yr: 0 }, EG: { mo: 0, yr: 0 } };
}

export function formatPrice(amount: number, currency: "SA" | "EG"): string {
  if (amount === 0) return currency === "SA" ? "مجاناً" : "مجاناً";
  const locale = currency === "SA" ? "ar-SA" : "ar-EG";
  const code = currency === "SA" ? "SAR" : "EGP";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
}
