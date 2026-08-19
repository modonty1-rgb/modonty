import Link from "next/link";

import { cn } from "@/lib/utils";

import { withArchiveChange, type ArchiveState } from "../../helpers/build-archive-href";
import { FOCUS_RING } from "../../helpers/focus-ring";

import type { ArchiveFilters } from "../../data/get-articles-filters";

interface FiltersBarProps {
  filters: ArchiveFilters;
  current: ArchiveState;
}

function Chip({
  href,
  label,
  active,
  small,
}: {
  href: string;
  label: string;
  active: boolean;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 transition-colors active:scale-[0.98] " + FOCUS_RING,
        small ? "text-xs" : "text-sm",
        active
          ? "border-primary bg-primary font-medium text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

/**
 * Fields across the top, categories underneath once a field is chosen.
 *
 * A rail was the wrong shape here. Measured 2026-08-19 on three real archives — Vercel, Stripe and
 * Intercom — all three are a SINGLE column with a horizontal category strip and no side rails at
 * all. Ours had copied the homepage's three columns, which left `/articles` reading as a second
 * homepage instead of a place to search.
 *
 * The second row appears only after a field is picked: showing every category at once is a wall
 * of eighteen chips, and the fields alone answer the first question a visitor has.
 */
export function FiltersBar({ filters, current }: FiltersBarProps) {
  const nothingPicked = !current.industry && !current.category;

  // Which field's categories to show: the one clicked, or the one the chosen category belongs to.
  const openIndustry =
    current.industry ??
    (current.category
      ? filters.categories.find((c) => c.slug === current.category)?.industrySlugs[0]
      : undefined);

  const categories = openIndustry
    ? filters.categories.filter((c) => c.industrySlugs.includes(openIndustry))
    : [];

  return (
    <div className="space-y-2">
      {/* One row that scrolls, not a block that wraps. Eight chips wrapped onto two lines and
          pushed the first article to 61% down the screen — Stripe keeps its categories on a single
          scrollable line for the same reason. */}
      <nav aria-label="تصفية بالمجال" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 scrollbar-none">
        <Chip
          href={withArchiveChange(current, { industry: undefined, category: undefined })}
          label="كل المجالات"
          active={nothingPicked}
        />
        {filters.industries.map((industry) => (
          <Chip
            key={industry.slug}
            href={withArchiveChange(current, { industry: industry.slug, category: undefined })}
            label={industry.name}
            active={openIndustry === industry.slug}
          />
        ))}
      </nav>

      {categories.length > 0 && (
        <nav aria-label="تصفية بالتصنيف" className="-mx-1 flex gap-2 overflow-x-auto border-t border-border px-1 pb-0.5 pt-2 scrollbar-none">
          {categories.map((category) => {
            const active = current.category === category.slug;
            return (
              <Chip
                key={category.slug}
                href={withArchiveChange(current, {
                  industry: openIndustry,
                  category: active ? undefined : category.slug,
                })}
                label={category.name}
                active={active}
                small
              />
            );
          })}
        </nav>
      )}
    </div>
  );
}
