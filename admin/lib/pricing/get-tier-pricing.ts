import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export type Country = "SA" | "EG";

export interface TierPricingRow {
  jbrseoId: string;
  name: string;
  articlesPerMonth: number;
  monthly: number;
  yearly: number;
}

interface PricingJson {
  SA?: { mo: number; yr: number };
  EG?: { mo: number; yr: number };
}

/**
 * Reads a single tier by jbrseoId and returns its pricing for the given country.
 * Reads from `pricing[country]` first; falls back to legacy `price` field if pricing JSON is empty.
 * Returns null if the tier doesn't exist.
 */
export const getTierPricing = unstable_cache(
  async (
    jbrseoId: string,
    country: Country = "SA"
  ): Promise<TierPricingRow | null> => {
    const tier = await db.subscriptionTierConfig.findUnique({
      where: { jbrseoId },
      select: {
        jbrseoId: true,
        name: true,
        articlesPerMonth: true,
        price: true,
        pricing: true,
      },
    });

    if (!tier) return null;

    const pricing = (tier.pricing as PricingJson | null) ?? {};
    const countryPricing = pricing[country];

    return {
      jbrseoId: tier.jbrseoId ?? jbrseoId,
      name: tier.name,
      articlesPerMonth: tier.articlesPerMonth,
      monthly: countryPricing?.mo ?? tier.price,
      yearly: countryPricing?.yr ?? tier.price * 12,
    };
  },
  ["tier-pricing"],
  { revalidate: 3600, tags: ["tier-pricing"] }
);

/**
 * Returns all tiers (for guideline pages that show full pricing tables).
 */
export const getAllTiersPricing = unstable_cache(
  async (country: Country = "SA"): Promise<TierPricingRow[]> => {
    const tiers = await db.subscriptionTierConfig.findMany({
      where: { jbrseoId: { not: null } },
      select: {
        jbrseoId: true,
        name: true,
        articlesPerMonth: true,
        price: true,
        pricing: true,
      },
      orderBy: { articlesPerMonth: "asc" },
    });

    return tiers.map((tier) => {
      const pricing = (tier.pricing as PricingJson | null) ?? {};
      const countryPricing = pricing[country];
      return {
        jbrseoId: tier.jbrseoId!,
        name: tier.name,
        articlesPerMonth: tier.articlesPerMonth,
        monthly: countryPricing?.mo ?? tier.price,
        yearly: countryPricing?.yr ?? tier.price * 12,
      };
    });
  },
  ["all-tiers-pricing"],
  { revalidate: 3600, tags: ["tier-pricing"] }
);
