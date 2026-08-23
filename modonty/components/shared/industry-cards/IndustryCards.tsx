import { IndustryTile } from "@/components/shared/industry-tile/IndustryTile";
import type { IndustryTileItem } from "@/components/shared/industry-tile/IndustryTile";

export type IndustryCardItem = IndustryTileItem;

interface IndustryCardsProps {
  items: IndustryCardItem[];
  /** The lit field — "" when nothing is narrowed. */
  currentSlug: string;
  /** Where a field card leads — a filtered URL on `/clients`. */
  buildHref: (slug: string) => string;
  /** Where the ACTIVE card leads — tapping the lit card is the way back. */
  clearHref: string;
  ariaLabel: string;
}

/**
 * The fields as a horizontal SWIPE STRIP — the same `IndustryTile` the `/industries` grid
 * shows (Khalid, 23 Aug: «use standard card in the industry page»), laid side by side so
 * the visitor scrolls them with a thumb («beside each other, I can scroll with my hand»).
 * `/clients` is its consumer: a card FILTERS the directory, the lit card clears the filter.
 * Callers hide it ≥1240px, where the rail takes over.
 *
 * Each card is as wide as one grid tile on a 390 screen (≈86px), so the two pages read as
 * one design; the strip just trades "all at once" for "keep the list above the fold".
 */
export function IndustryCards({ items, currentSlug, buildHref, clearHref, ariaLabel }: IndustryCardsProps) {
  return (
    <nav aria-label={ariaLabel} className="-mx-3 sm:-mx-4">
      <ul className="flex snap-x snap-proximity gap-2 overflow-x-auto px-3 pb-2 scrollbar-none sm:px-4">
        {items.map((item) => {
          const isActive = item.slug === currentSlug;
          return (
            <li key={item.slug} className="w-[86px] shrink-0 snap-start">
              <IndustryTile item={item} isActive={isActive} href={isActive ? clearHref : buildHref(item.slug)} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
