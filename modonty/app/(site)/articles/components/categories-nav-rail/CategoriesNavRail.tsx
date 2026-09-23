import Link from "next/link";

import { cn } from "@/lib/utils";
import { withArchiveChange, type ArchiveState } from "@/lib/articles/archive/build-archive-href";
import type { ArchiveFilters } from "@/lib/articles/archive/get-articles-filters";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface CategoriesNavRailProps {
  filters: ArchiveFilters;
  current: ArchiveState;
}

/** Desktop archive navigation: topics belong beside the reading feed, not inside its search row. */
export function CategoriesNavRail({ filters, current }: CategoriesNavRailProps) {
  return (
    <nav aria-label="تصنيفات المقالات" className="rounded-lg bg-card p-3 ring-1 ring-primary/10">
      <h2 className="mb-2 px-2 text-xs font-medium text-muted-foreground">التصنيفات</h2>
      <ul>
        <li>
          <Link
            href={withArchiveChange(current, { modonty: undefined, industry: undefined, category: undefined })}
            aria-current={!current.modonty && !current.industry && !current.category ? "page" : undefined}
            className={cn(
              "flex min-h-9 items-center justify-between gap-2 rounded-full px-2 text-sm transition-colors sm:hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              !current.modonty && !current.industry && !current.category ? "bg-primary/[.07] font-medium text-link" : "text-foreground",
            )}
          >
            <span>كل التصنيفات</span>
            <span className="shrink-0 text-xs text-muted-foreground">{filters.total.toLocaleString(SITE_LOCALE)}</span>
          </Link>
        </li>
        {filters.categories.map((category) => {
          const active = current.category === category.slug;
          return (
            <li key={category.slug}>
              <Link
                href={withArchiveChange(current, {
                  modonty: undefined,
                  industry: undefined,
                  category: active ? undefined : category.slug,
                })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-9 items-center justify-between gap-2 rounded-full px-2 text-sm transition-colors sm:hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  active ? "bg-primary/[.07] font-medium text-link" : "text-foreground",
                )}
              >
                <span className="truncate">{category.name}</span>
                <span className={cn("shrink-0 text-xs", active ? "text-link" : "text-muted-foreground")}>
                  {category.count.toLocaleString(SITE_LOCALE)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
