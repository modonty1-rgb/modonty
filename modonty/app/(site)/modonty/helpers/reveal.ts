/**
 * One orchestrated page-load reveal for `/modonty` (Track B: a single staggered
 * entrance, not scattered micro-motion). Pure `tailwindcss-animate` utilities — no
 * library — and gated on `motion-safe` so reduced-motion users get the content still.
 * `step` 0 = hero, 1 = articles, 2 = rails; 75ms apart (the gallery rides inside the left rail).
 */
const DELAYS = ["", "delay-75", "delay-150"] as const;

export function reveal(step: 0 | 1 | 2): string {
  return `motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both motion-safe:duration-500 motion-safe:ease-out ${DELAYS[step]}`.trim();
}
