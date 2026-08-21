import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IndustriesCarousel } from "@/app/(site)/(homepage)/components/industries-card/IndustriesCarousel";

interface IndustryPreview {
  id: string;
  name: string;
  slug: string;
  clientCount: number;
  socialImage?: string | null;
  description?: string | null;
}

interface IndustriesCardProps {
  industries: IndustryPreview[];
  /**
   * `rail` — desktop side rail (300px): LinkedIn-style rows — square image, name, one
   * line of description from the DB — six visible, the rest scroll inside the card.
   * `row`  — phones: a compact multi-browse carousel above the feed.
   */
  layout: "rail" | "row";
}

// Rail: six rows visible, the rest reachable by scrolling inside the card (Khalid,
// 2026-08-15) — no «كل المجالات» link; the row on phones scrolls through all of them.
const RAIL_VISIBLE_ROWS = 6;
const RAIL_ROW_HEIGHT = 56; // = min-h-14 on each row

function IndustryImage({ industry, sizes, className }: { industry: IndustryPreview; sizes: string; className: string }) {
  return (
    <span className={`relative shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary to-secondary ring-1 ring-inset ring-transparent transition-shadow sm:group-hover:ring-primary ${className}`}>
      {industry.socialImage ? (
        <OptimizedImage media={asMedia(industry.socialImage, industry.name)} alt="" fill sizes={sizes} loading="lazy" className="object-cover" />
      ) : (
        <span aria-hidden className="absolute inset-0 grid place-items-center text-xl font-bold text-white">
          {industry.name.trim().charAt(0)}
        </span>
      )}
    </span>
  );
}

// Text sits beside or under the image, never on it, so contrast does not depend on
// whatever picture the industry gets. The partner count only sorts the list.
export function IndustriesCard({ industries, layout }: IndustriesCardProps) {
  const sorted = [...industries]
    .filter((industry) => industry.clientCount > 0)
    .sort((first, second) => second.clientCount - first.clientCount);

  if (sorted.length === 0) return null;

  // Both layouts are in the DOM at once (rail on desktop, row on phones — CSS hides the
  // other), so the heading id must differ or the page ships a duplicate id.
  const headingId = `industries-heading-${layout}`;

  if (layout === "rail") {
    return (
      <section aria-labelledby={headingId} className="relative overflow-hidden rounded-lg ring-1 ring-primary/10 bg-card">
        <div className="px-4 py-2">
          <h2 id={headingId} className="text-base font-medium text-foreground">استكشف المجالات</h2>
        </div>
        {/* Bottom fade: says «more below» without a visible scrollbar. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-card to-transparent" aria-hidden />
        <ul
          className="overflow-y-auto overscroll-contain px-2 pb-2 scrollbar-rail"
          style={{ maxHeight: RAIL_VISIBLE_ROWS * RAIL_ROW_HEIGHT + 8 }}
        >
          {sorted.map((industry) => {
            const description = industry.description?.trim();
            return (
              <li key={industry.id}>
                <Link
                  href={`/industries/${encodeURIComponent(industry.slug)}`}
                  className="group flex min-h-14 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors sm:hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <IndustryImage industry={industry} sizes="44px" className="size-11" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{industry.name}</span>
                    {/* Only when the admin wrote one — never a placeholder line. */}
                    {description && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{description}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return <IndustriesCarousel industries={sorted} headingId={headingId} />;
}
