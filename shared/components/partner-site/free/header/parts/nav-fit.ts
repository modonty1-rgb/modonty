import type { HeaderNavLink } from "../header-data";

/**
 * Where the desktop menu goes. Eight links at 14px need ≈770px with 24px gaps; beside the logo,
 * the «شريك موثَّق» pill, the phone and WhatsApp that overflowed even at 1280 — measured on a
 * fully-filled test partner, every two-word link broke onto two lines (4 Oct 2026).
 *
 * - Up to six links: one row from `md`.
 * - More, with `secondRow`: the links get their own row under the bar from `lg` (976px is room for
 *   all eight), the burger serves below it.
 * - More, without a second row (the transparent header floats over the cover): one row from `xl`.
 * Literal class strings so Tailwind sees them.
 */
export function navFit(links: HeaderNavLink[], options?: { secondRow?: boolean }): { nav: string; burger: "md:hidden" | "lg:hidden" | "xl:hidden"; row: string | null } {
  if (links.length <= 6) return { nav: "hidden md:flex", burger: "md:hidden", row: null };
  if (options?.secondRow) return { nav: "hidden", burger: "lg:hidden", row: "hidden border-t lg:block" };
  return { nav: "hidden xl:flex", burger: "xl:hidden", row: null };
}
