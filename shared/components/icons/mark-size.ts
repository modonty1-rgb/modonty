import type { SVGProps } from "react";

/**
 * Brand-mark props: the SVG props plus an optional pixel `size`.
 *
 * Every v2 mark ships two drawings (documents/design/ICON-STANDARD-v2.md §1):
 * M24 for 20 px and up, M16 for smaller sizes, because a 24-grid drawing scaled to 16 px
 * loses a third of its stroke. `size` picks the master and sets the box; without it the
 * mark keeps its `1em` box and reads the Tailwind size classes it was given.
 */
export type MarkProps = SVGProps<SVGSVGElement> & { size?: number };

/** `size-3`…`size-4.5`, `h-…`, `w-…` without a breakpoint prefix = rendered below 20 px. */
const SMALL_CLASS = /(?:^|\s)(?:size|h|w)-(?:3|3\.5|4|4\.5)(?=\s|$)/;

/** Which master to draw, and the box attributes every mark's root `<svg>` shares. */
export function markSize(size: number | undefined, className: string | undefined) {
  const small = typeof size === "number" ? size < 20 : typeof className === "string" && SMALL_CLASS.test(className);
  const edge = size ?? "1em";
  return { small, box: { width: edge, height: edge, fill: "none", "aria-hidden": true } as const };
}
