import Link from "next/link";

import { cn } from "@/lib/utils";

import { withArchiveChange, type ArchiveState } from "../../helpers/build-archive-href";

import type { ArchiveFilters } from "../../data/get-articles-filters";

interface FiltersRailProps {
  filters: ArchiveFilters;
  current: ArchiveState;
}

/**
 * The right column: every field, with the categories that actually live inside it nested
 * underneath.
 *
 * Khalid asked for the nesting and for the separate category box to go (2026-08-19: «كل ما جال،
 * حط التصنيفات اللي موجودة… وشيل قسم التصنيفات»). One list instead of two answers the question a
 * visitor actually has — "what is in this field?" — without making him match two boxes by eye.
 *
 * No count badges: they read as dated («موضة قديمة جداً») and they were solving a problem that no
 * longer exists — an option with zero articles never reaches this component, so no row here can
 * lead to an empty page whether or not it shows a number.
 *
 * The industry→category link is not stored anywhere: it is derived from the articles themselves
 * (article → partner → industry), so a category that genuinely spans two fields appears under
 * both. «التقنية والذكاء الاصطناعي» is exactly that case, and a stored `industryId` would have
 * hidden one of them.
 */
export function FiltersRail({ filters, current }: FiltersRailProps) {
  const nothingPicked = !current.industry && !current.category;

  return (
    <nav aria-label="تصفية بالمجال" className="rounded-xl border border-border bg-card p-3">
      <h2 className="mb-2 text-sm font-bold text-foreground">المجال</h2>

      <Link
        href={withArchiveChange(current, { industry: undefined, category: undefined })}
        aria-current={nothingPicked ? "true" : undefined}
        className={cn(
          "block truncate py-1.5 text-sm transition-colors",
          nothingPicked ? "font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        كل المجالات
      </Link>

      <ul>
        {filters.industries.map((industry) => {
          const children = filters.categories.filter((c) => c.industrySlugs.includes(industry.slug));
          // A category implies its field, so the field reads as chosen even when only the
          // category was clicked.
          const industryActive =
            current.industry === industry.slug ||
            (!!current.category && children.some((c) => c.slug === current.category));

          return (
            <li key={industry.slug} className="border-t border-border">
              <Link
                href={withArchiveChange(current, { industry: industry.slug, category: undefined })}
                aria-current={current.industry === industry.slug ? "true" : undefined}
                className={cn(
                  "block truncate py-1.5 text-sm transition-colors",
                  industryActive ? "font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {industry.name}
              </Link>

              {children.length > 0 && (
                <ul className="mb-1.5 border-s border-border ps-2.5">
                  {children.map((category) => {
                    const active = current.category === category.slug;
                    return (
                      <li key={category.slug}>
                        <Link
                          href={withArchiveChange(current, {
                            industry: industry.slug,
                            category: active ? undefined : category.slug,
                          })}
                          aria-current={active ? "true" : undefined}
                          className={cn(
                            "block truncate py-1 text-xs transition-colors",
                            active ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {category.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
