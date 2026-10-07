import type { Ga4FooterStats } from "@/lib/analytics/ga4";
import type { SearchConsoleTotals } from "./search-console-totals";
import { formatHero } from "./format-hero";

/** الرقم الكبير — أكبرُ رقمٍ صادق: ظهور Search Console، وإلا مشاهدات GA4. */
export function buildFooterHero(ga4: Ga4FooterStats | null, gsc: SearchConsoleTotals | null) {
  return gsc
    ? { value: formatHero(gsc.impressions), label: "ظهور في بحث جوجل", source: "Search Console" }
    : { value: formatHero(ga4!.pageViews), label: "مشاهدة صفحة", source: "Analytics" };
}
