import Link from "next/link";

import { cn } from "@/lib/utils";

import { withArchiveChange, type ArchiveState } from "../../helpers/build-archive-href";

import type { ArchiveFilters } from "../../data/get-articles-filters";

interface FiltersRailProps {
  filters: ArchiveFilters;
  current: ArchiveState;
}

function Row({ href, label, count, active }: { href: string; label: string; count: number; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 border-t border-border py-1.5 text-sm transition-colors first:border-t-0",
        active ? "font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span className="truncate">{label}</span>
      <span
        className={cn(
          "shrink-0 rounded-full px-1.5 text-xs tabular-nums",
          active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {count.toLocaleString("ar-SA")}
      </span>
    </Link>
  );
}

/**
 * The right column: the reason this page exists.
 *
 * Two boxes that answer each other — picking an industry shrinks the category list to that
 * industry's categories, and picking a category marks the industry it belongs to. Neither link
 * is derived from a stored relation: the category's industries come from the articles themselves
 * (see `get-articles-filters.ts`).
 *
 * Every row carries its count, and a zero-count option never reaches this component — a link that
 * leads to an empty page is worse than one the visitor never saw.
 */
export function FiltersRail({ filters, current }: FiltersRailProps) {
  // Picking an industry narrows the categories; picking nothing shows them all.
  const visibleCategories = current.industry
    ? filters.categories.filter((c) => c.industrySlugs.includes(current.industry!))
    : filters.categories;

  // …and picking a category marks its industry, even when no industry was clicked.
  const impliedIndustries = current.category
    ? (filters.categories.find((c) => c.slug === current.category)?.industrySlugs ?? [])
    : [];

  return (
    <div className="space-y-3">
      <nav aria-label="تصفية بالمجال" className="rounded-xl border border-border bg-card p-3">
        <h2 className="mb-2 text-sm font-bold text-foreground">المجال</h2>
        {/* Not active while a category is picked: that category implies an industry, and two
            highlighted rows tell the visitor nothing (measured live 2026-08-19 — «كل المجالات»
            stayed lit and the implied industry read as unselected). */}
        <Row
          href={withArchiveChange(current, { industry: undefined })}
          label="كل المجالات"
          count={filters.total}
          active={!current.industry && !current.category}
        />
        {filters.industries.map((industry) => (
          <Row
            key={industry.slug}
            href={withArchiveChange(current, { industry: industry.slug, category: undefined })}
            label={industry.name}
            count={industry.count}
            active={current.industry === industry.slug || impliedIndustries.includes(industry.slug)}
          />
        ))}
      </nav>

      {visibleCategories.length > 0 && (
        <nav aria-label="تصفية بالتصنيف" className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-foreground">التصنيف</h2>
            {current.category && (
              <Link
                href={withArchiveChange(current, { category: undefined })}
                className="text-xs font-medium text-link hover:underline"
              >
                امسح
              </Link>
            )}
          </div>
          {visibleCategories.map((category) => (
            <Row
              key={category.slug}
              href={withArchiveChange(current, { category: category.slug })}
              label={category.name}
              count={category.count}
              active={current.category === category.slug}
            />
          ))}
        </nav>
      )}
    </div>
  );
}
