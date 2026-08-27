import type { SVGProps } from "react";

/**
 * The modonty ARROW mark — «اقرأ المزيد ←», «التالي», any «go on» in the reading flow.
 *
 * NOT in `modonty_icon_system_MASTER_COMPLETE.html` — the approved 38 have no arrow or
 * chevron — so this one is drawn to the file's Geometry Standard rather than traced:
 * 120 canvas · 8px stroke · round caps and joins · content inside the 16px safe margin.
 * The shaft-plus-two-head-strokes construction is lifted from the approved `sort` mark
 * (`M42 94V26M42 26L30 38M42 26L54 38`), so an arrow beside a sort control reads as the
 * same hand.
 *
 * It shipped without a diamond at first, on the reading that the reference makes it
 * optional for Utility icons. Khalid overruled that on 22 Aug — «where is our branding
 * icon» — and he is right on the reference's own terms: the diamond is not decoration
 * there, it is "a functional node", and an arrow has an obvious one. It sits at the TAIL,
 * where the movement begins, and the shaft runs out of it toward the head. So the mark
 * reads as «from here, onward» rather than as a bare arrow with a bead stuck on it.
 *
 * It points to the START of the line, which in RTL is the LEFT — the direction Arabic
 * reading moves, which puts the diamond on the right where the eye starts. On an LTR
 * surface pass `className="rtl:rotate-180"` from the caller; the mark itself stays one
 * fixed drawing.
 *
 * Contract: `currentColor` + a `1em` box, two CSS hooks — `--modonty-arrow-body` ·
 * `--modonty-arrow-accent` (the diamond).
 */
export function ModontyArrowMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M80 60H26M26 60L46 40M26 60L46 80"
        stroke="var(--modonty-arrow-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="83"
        y="53"
        width="14"
        height="14"
        rx="2"
        transform="rotate(45 90 60)"
        fill="var(--modonty-arrow-accent, hsl(var(--accent)))"
      />
    </svg>
  );
}
