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
        // One shape for every sub-filter on this page: the same rounded-lg + ring the
        // reading-time buttons wear (Khalid, 21 Aug: the category row was still a pill
        // while the fields had become cards — two languages on one screen). 44px under
        // the desktop breakpoint (Apple's touch floor; Material asks 48); ≥1240px it
        // keeps the old 36 for a pointer.
        "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-lg px-3 ring-1 transition-colors active:scale-[0.98] min-[1240px]:min-h-9 " + FOCUS_RING,
        small ? "text-xs" : "text-sm",
        active
          ? "bg-primary font-medium text-primary-foreground ring-primary"
          : "bg-card text-muted-foreground ring-border hover:text-foreground hover:ring-primary/40"
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
      {/* The field GRID lived here below 1240px for a day (22–23 Aug); Khalid moved it to
          `/industries`, where picking a sector is the page's whole job. On a phone this page
          now filters by TIME and searches by WORD only — a reader who wants to browse by
          field has the tab bar's «المجالات» one tap away. The chip strip below is ≥1240px,
          so on a phone this component renders nothing until a category axis exists. */}
      <nav aria-label="تصفية بالمجال" className="-mx-1 hidden gap-2 overflow-x-auto px-1 pb-0.5 scrollbar-none min-[1240px]:flex">
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

      {/* Categories are a DESKTOP-only second axis (Khalid, 21 Aug). On a phone they added
          a row that appears after a tap, shifts the page, and repeats what the field
          already said — «السياحة العلاجية» opens «الرعاية الصحية». One axis on mobile. */}
      {categories.length > 0 && (
        <nav aria-label="تصفية بالتصنيف" className="-mx-1 hidden gap-2 overflow-x-auto border-t border-border px-1 pb-0.5 pt-2 scrollbar-none min-[1240px]:flex">
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
