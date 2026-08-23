import { IndustryTile } from "@/components/shared/industry-tile/IndustryTile";
import type { IndustryTileItem } from "@/components/shared/industry-tile/IndustryTile";

export type IndustryGridItem = IndustryTileItem;

interface IndustryGridProps {
  items: IndustryGridItem[];
  /** The lit field — "" when nothing is narrowed. */
  currentSlug: string;
  /** Where a field tile leads. */
  buildHref: (slug: string) => string;
  /** Where the ACTIVE tile leads — tapping the lit tile is the way back. */
  clearHref: string;
  ariaLabel: string;
}

/**
 * The fields as a GRID, four to a row. Born on `/articles` (Khalid, 22 Aug: «المجالات في
 * النص بتنسيق أنيق»), moved to `/industries` when he split the pages by intent. The tile
 * itself is `IndustryTile`, shared with the `/clients` swipe strip — one visual language
 * for choosing a field, whether the tile navigates or filters; only the caller decides.
 *
 * A grid, not a horizontal strip: a strip shows four of the fields and hides the rest
 * behind a swipe, and the whole point of `/industries` is that the visitor sees every
 * sector he could pick before he picks one.
 */
export function IndustryGrid({ items, currentSlug, buildHref, clearHref, ariaLabel }: IndustryGridProps) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const isActive = item.slug === currentSlug;
          return (
            <li key={item.slug}>
              <IndustryTile item={item} isActive={isActive} href={isActive ? clearHref : buildHref(item.slug)} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
