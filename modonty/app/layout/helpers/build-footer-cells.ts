import type { Ga4FooterStats } from "@/lib/analytics/ga4";
import type { SearchConsoleTotals } from "./search-console-totals";
import type { PlatformCounts } from "./get-platform-counts";

/** الأرقام الثانوية بجانب الكبير، كلٌّ مع مصدره — تسقط الخلية التي لا مصدر لها. */
export function buildFooterCells(ga4: Ga4FooterStats | null, gsc: SearchConsoleTotals | null, platform: PlatformCounts) {
  return [
    gsc ? { value: gsc.clicks, label: "زيارة من بحث جوجل", source: "Search Console" } : null,
    ga4 && gsc ? { value: ga4.pageViews, label: "مشاهدة صفحة", source: "Analytics" } : null,
    { value: platform.articles, label: "مقالاً منشوراً", source: "مدونتي" },
    { value: platform.partners, label: "شريكاً موثوقاً", source: "مدونتي" },
    { value: platform.industries, label: "مجالات", source: "مدونتي" },
  ].filter((c): c is { value: number; label: string; source: string } => c !== null);
}
