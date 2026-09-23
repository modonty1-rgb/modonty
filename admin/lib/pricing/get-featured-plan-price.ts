import "server-only";
import { getFeaturedPlanPricing, type Country } from "./get-featured-plan-pricing";

const arabicNum = new Intl.NumberFormat("ar-SA");
const enGbNum = new Intl.NumberFormat("en-GB");

export interface FormattedPrice {
  monthly: string;        // "1,199"
  yearly: string;         // "14,388"
  monthlyAr: string;      // "١٬١٩٩"
  yearlyAr: string;       // "١٤٬٣٨٨"
  articles: number;       // 12
  name: string;           // "الزخم"
}

/**
 * سعرُ الباقة المميَّزة («الأكثر اختياراً») منسَّقاً لصفحات الدليل — اسمُها معه، فالجملةُ
 * تقول «الزخم ١٬١٩٩» لا «Momentum» مكتوبةً باليد. `null` حين لا باقةَ مميَّزة بسعرٍ في السوق.
 */
export async function getFeaturedPlanPrice(country: Country = "SA"): Promise<FormattedPrice | null> {
  const plan = await getFeaturedPlanPricing(country);
  if (!plan) return null;

  return {
    monthly: enGbNum.format(plan.monthly),
    yearly: enGbNum.format(plan.yearly),
    monthlyAr: arabicNum.format(plan.monthly),
    yearlyAr: arabicNum.format(plan.yearly),
    articles: plan.articlesPerMonth,
    name: plan.name,
  };
}
