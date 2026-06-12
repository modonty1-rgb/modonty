import type { HeroPageState } from "./client-hero-v2";
import { IconUsers, IconArticle, IconViews, IconFeatured } from "@/lib/icons";

interface HeroStatsData {
  followers: number;
  articles: number;
  totalViews: number;
  rating: number;
  reviewCount: number;
}

interface HeroStatsProps {
  stats: HeroStatsData;
  pageState: HeroPageState;
}

const arNum = new Intl.NumberFormat("ar-SA");

/** 1234 → "1.2k", below 1000 stays as-is (Arabic numerals). */
function formatCompact(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    const rounded = k >= 10 ? Math.round(k) : Math.round(k * 10) / 10;
    return `${arNum.format(rounded)}k`;
  }
  return arNum.format(n);
}

type StatIcon = typeof IconFeatured;

/** Icon + number + label stat strip. Zero-value stats are hidden (a "0" reads as
 *  weak/empty); the strip adapts to however many real numbers remain, and disappears
 *  entirely when nothing is left. The label keeps each metric unambiguous (icon alone
 *  isn't enough for trust stats); the rating star is gold for emphasis. */
export function HeroStats({ stats, pageState }: HeroStatsProps) {
  void pageState;

  const cells: { key: string; icon: StatIcon; value: string; label: string }[] = [];
  if (stats.rating > 0)
    cells.push({ key: "rating", icon: IconFeatured, value: arNum.format(stats.rating), label: "تقييم" });
  if (stats.totalViews > 0)
    cells.push({ key: "views", icon: IconViews, value: formatCompact(stats.totalViews), label: "مشاهدة" });
  if (stats.articles > 0)
    cells.push({ key: "articles", icon: IconArticle, value: arNum.format(stats.articles), label: "مقالات" });
  if (stats.followers > 0)
    cells.push({ key: "followers", icon: IconUsers, value: arNum.format(stats.followers), label: "متابع" });

  if (cells.length === 0) return null;

  return (
    <div className="mt-4 flex overflow-hidden rounded-md border border-border bg-muted">
      {cells.map((c) => {
        const Icon = c.icon;
        const isRating = c.key === "rating";
        return (
          <div
            key={c.key}
            className="flex flex-1 flex-col items-center gap-1 border-e border-border px-2 py-3 last:border-e-0"
          >
            <span className="flex items-center gap-1">
              <Icon
                className={`size-4 ${isRating ? "fill-current text-star" : "text-muted-foreground"}`}
                aria-hidden
              />
              <b className="text-[18px] font-black leading-none text-foreground">{c.value}</b>
            </span>
            <span className="whitespace-nowrap text-[12px] text-muted-foreground">{c.label}</span>
          </div>
        );
      })}
    </div>
  );
}
