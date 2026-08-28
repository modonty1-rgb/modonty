import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/i18n/messages";
import type { IndustryListItem } from "@/lib/types";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

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
      <ul>
        {industries.map((industry) => {
          const isActive = industry.slug === currentSlug;
          return (
            <li key={industry.slug}>
              <Link
                href={`/industries/${encodeURIComponent(industry.slug)}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-9 items-center justify-between gap-2 rounded-full px-2 text-sm transition-colors sm:hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive ? "bg-primary/[.07] font-medium text-link" : "text-foreground",
                )}
              >
                <span className="truncate">{industry.name}</span>
                <span className={cn("shrink-0 text-xs", isActive ? "text-link" : "text-muted-foreground")}>
                  {industry.clientCount.toLocaleString(SITE_LOCALE)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
