import type { HeroPageState } from "./client-hero-v2";

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
function formatCompact(n: number): { value: string; unit?: string } {
  if (n >= 1000) {
    const k = n / 1000;
    const rounded = k >= 10 ? Math.round(k) : Math.round(k * 10) / 10;
    return { value: arNum.format(rounded), unit: "k" };
  }
  return { value: arNum.format(n) };
}

/** 4-cell stats grid. Hidden when client is sparse or all stats are zero. */
export function HeroStats({ stats, pageState }: HeroStatsProps) {
  const allZero =
    stats.followers === 0 &&
    stats.articles === 0 &&
    stats.totalViews === 0 &&
    stats.rating === 0;

  if (pageState === "sparse" || allZero) return null;

  const views = formatCompact(stats.totalViews);
  const rating = stats.rating > 0 ? arNum.format(stats.rating) : "—";

  return (
    <div className="mt-4 grid grid-cols-4 overflow-hidden rounded-md border border-border bg-muted">
      <StatCell value={arNum.format(stats.followers)} label="متابع" highlight />
      <StatCell value={arNum.format(stats.articles)} label="مقال منشور" />
      <StatCell value={views.value} unit={views.unit} label="مشاهدة" />
      <StatCell value={rating} star label="تقييم" />
    </div>
  );
}

function StatCell({
  value,
  unit,
  star,
  label,
  highlight,
}: {
  value: string;
  unit?: string;
  star?: boolean;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="border-e border-border px-2 py-3 text-center last:border-e-0">
      <b
        className={`block text-[19px] font-black leading-none ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
        {unit && <span className="text-[11px] font-semibold text-muted-foreground">{unit}</span>}
        {star && <span className="text-star"> ★</span>}
      </b>
      <span className="mt-1 inline-block text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
