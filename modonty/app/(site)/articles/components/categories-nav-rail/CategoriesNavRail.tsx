import Link from "next/link";

import { cn } from "@/lib/utils";
import { withArchiveChange, type ArchiveState } from "@/lib/articles/archive/build-archive-href";
import type { ArchiveFilters, CategoryOption } from "@/lib/articles/archive/get-articles-filters";
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
        {filters.categories.map((category) => (
          <li key={category.slug}>
            <CategoryLink category={category} current={current} />
            {/* Sub-categories under their main category, indented — not beside it as peers
                (Khalid, 24 Sep 2026). The main category's count already includes them. */}
            {category.children.length ? (
              <ul className="ms-3 border-s border-border/60 ps-1.5">
                {category.children.map((child) => (
                  <li key={child.slug}>
                    <CategoryLink category={child} current={current} sub />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CategoryLink({ category, current, sub = false }: { category: CategoryOption; current: ArchiveState; sub?: boolean }) {
  const active = current.category === category.slug;
  return (
    <Link
      href={withArchiveChange(current, {
        modonty: undefined,
        industry: undefined,
        category: active ? undefined : category.slug,
      })}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 rounded-full px-2 transition-colors sm:hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        sub ? "min-h-8 text-[13px]" : "min-h-9 text-sm",
        active ? "bg-primary/[.07] font-medium text-link" : sub ? "text-muted-foreground" : "text-foreground",
      )}
    >
      <span className="truncate">{category.name}</span>
      <span className={cn("shrink-0 text-xs", active ? "text-link" : "text-muted-foreground")}>
        {category.count.toLocaleString(SITE_LOCALE)}
      </span>
    </Link>
  );
}
