import { IndustryTile } from "@/components/shared/industry-tile/IndustryTile";
import { formatCount } from "@/lib/i18n/messages";
import { industryArtwork } from "@/lib/industry-artwork";
import type { IndustryListItem } from "@/lib/types";

const INDUSTRY_COUNT = { one: "مجال واحد", two: "مجالين", few: "مجالات", many: "مجالاً" } as const;

interface IndustriesNavRailProps {
  industries: IndustryListItem[];
  currentSlug: string;
}

/**
 * Every other industry, one click away — the visitor came in through one field, so
 * switching to another shouldn't mean a trip back to `/industries`. Real links to real
 * routes (Khalid, 2026-08-16: three columns — fields · articles · partners), not a query
 * param: each industry is its own page with its own feed, not a filtered view of this one.
 */
export function IndustriesNavRail({ industries, currentSlug }: IndustriesNavRailProps) {
  return (
    <nav aria-label="المجالات" className="rounded-lg bg-card p-3 ring-1 ring-primary/10">
      <h2 className="mb-2 px-2 text-xs font-medium text-muted-foreground">
        {formatCount(industries.length, INDUSTRY_COUNT)}
      </h2>
      <ul className="grid grid-cols-2 gap-2" role="list">
        {industries.map((industry) => {
          const isActive = industry.slug === currentSlug;
          return (
            <li key={industry.slug}>
              <IndustryTile
                item={{
                  name: industry.name,
                  slug: industry.slug,
                  count: industry.clientCount,
                  image: industryArtwork(industry.socialImage),
                  imageAlt: industry.socialImageAlt,
                }}
                href={`/industries/${encodeURIComponent(industry.slug)}`}
                isActive={isActive}
                variant="compact"
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
