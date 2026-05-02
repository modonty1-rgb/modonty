import "server-only";
import { getTierPricing, type Country } from "./get-tier-pricing";

const arabicNum = new Intl.NumberFormat("ar-SA");
const enGbNum = new Intl.NumberFormat("en-GB");

export interface FormattedPrice {
  monthly: string;        // "1,299"
  yearly: string;         // "15,588"
  monthlyAr: string;      // "١٬٢٩٩"
  yearlyAr: string;       // "١٥٬٥٨٨"
  articles: number;       // 8
  name: string;           // "الزخم"
}

/**
 * Formats pricing for a tier in a guideline page.
 * Returns null if the tier doesn't exist (so guideline pages can fall back gracefully).
 */
export async function formatPriceForGuideline(
  jbrseoId: string,
  country: Country = "SA"
): Promise<FormattedPrice | null> {
  const tier = await getTierPricing(jbrseoId, country);
  if (!tier) return null;

  return {
    monthly: enGbNum.format(tier.monthly),
    yearly: enGbNum.format(tier.yearly),
    monthlyAr: arabicNum.format(tier.monthly),
    yearlyAr: arabicNum.format(tier.yearly),
    articles: tier.articlesPerMonth,
    name: tier.name,
  };
}

/**
 * Returns the Momentum/growth tier price formatted for guideline use.
 * Convenience wrapper for the most-used tier.
 */
export async function getMomentumPrice(country: Country = "SA"): Promise<FormattedPrice | null> {
  return formatPriceForGuideline("growth", country);
}

/**
 * Returns Leadership/scale tier price formatted.
 */
export async function getLeadershipPrice(country: Country = "SA"): Promise<FormattedPrice | null> {
  return formatPriceForGuideline("scale", country);
}
