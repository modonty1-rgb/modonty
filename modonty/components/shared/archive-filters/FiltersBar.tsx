import Link from "next/link";

import { cn } from "@/lib/utils";

import { withArchiveChange, type ArchiveState } from "@/lib/articles/archive/build-archive-href";
import { FOCUS_RING } from "@/lib/articles/archive/focus-ring";

import type { ArchiveFilters } from "@/lib/articles/archive/get-articles-filters";

interface FiltersBarProps {
  filters: ArchiveFilters;
  current: ArchiveState;
}

function Chip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
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
        "text-sm",
        active
          ? "bg-secondary font-medium text-secondary-foreground ring-border"
          : "bg-card text-muted-foreground ring-border hover:text-foreground hover:ring-primary/40"
      )}
    >
      {label}
    </Link>
  );
}

/** Article discovery is by content category; partner industries live on their own page. */
export function FiltersBar({ filters, current }: FiltersBarProps) {
  const nothingPicked = !current.industry && !current.category;

  return (
    <div className="space-y-2">
      {/* A single scrolling row preserves space for the articles while exposing the content
          topics people came to browse. Industries remain available from `/industries`. */}
      <nav aria-label="تصفية بالتصنيف" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 scrollbar-none min-[1240px]:hidden">
        <Chip
          href={withArchiveChange(current, { industry: undefined, category: undefined })}
          label="كل التصنيفات"
          active={nothingPicked}
        />
        {filters.categories.map((category) => (
          <Chip
            key={category.slug}
            href={withArchiveChange(current, {
              industry: undefined,
              category: current.category === category.slug ? undefined : category.slug,
            })}
            label={category.name}
            active={current.category === category.slug}
          />
        ))}
      </nav>
    </div>
  );
}
