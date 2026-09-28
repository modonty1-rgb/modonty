import Link from "next/link";

export const SECTOR_TABS = ["page", "articles", "places"] as const;
export type SectorTab = (typeof SECTOR_TABS)[number];

const LABELS: Record<SectorTab, string> = { page: "الصفحة", articles: "المقالات", places: "الأماكن" };

/**
 * One job at a time (Khalid, 28 Sep 2026: hero, articles and SEO stacked on one page was «تشويش
 * بصري»; hero and SEO then share «الصفحة» — «ما في داتا كثيرة فيهم»). Links, not buttons — the
 * tab lives in the URL (`?tab=`), so a save's refresh and the library search keep you where you
 * were. The status beside each says whether it needs work. «الأماكن» only where the sector has a
 * guide to curate (entertainment).
 */
export function SectorTabs({
  base,
  active,
  tabs,
  status,
}: {
  base: string;
  active: SectorTab;
  tabs: readonly SectorTab[];
  status: Partial<Record<SectorTab, { text: string; done: boolean }>>;
}) {
  return (
    <nav aria-label="أقسام الصفحة" className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const isActive = tab === active;
        const s = status[tab];
        return (
          <Link
            key={tab}
            href={`${base}?tab=${tab}`}
            aria-current={isActive ? "page" : undefined}
            className={[
              "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
              isActive ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {LABELS[tab]}
            {s && (
              <span
                className={[
                  "rounded-full px-1.5 py-px text-[11px] tabular-nums",
                  s.done ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                ].join(" ")}
              >
                {s.text}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
