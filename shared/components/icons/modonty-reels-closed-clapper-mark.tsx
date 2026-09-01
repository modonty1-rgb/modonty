import type { SVGProps } from "react";

/**
 * Flat clapperboard mark for the Reels destination.
 *
 * Colours come from theme tokens, never hex literals: a mark written in `#4B39C3` keeps its
 * light-theme fill on a dark surface, and the brand rule here is that the body stays muted
 * (`currentColor`, inherited from the link) while the diamond alone carries the accent.
 * Each layer is still overridable through its own CSS hook for one-off surfaces.
 */
export function ModontyReelsClosedClapperMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 512 512" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <rect
        width="512"
        height="512"
        rx="128"
        fill="var(--modonty-reels-body, currentColor)"
      />
      {/* The hinge stripe — the one accent element, per the brand rule. */}
      <rect
        x="76"
        y="68"
        width="56"
        height="96"
        rx="28"
        fill="var(--modonty-reels-accent, hsl(var(--accent)))"
        transform="rotate(-35 104 116)"
      />
      <rect
        x="194"
        y="68"
        width="56"
        height="96"
        rx="28"
        fill="var(--modonty-reels-cutout, hsl(var(--background)))"
        transform="rotate(-35 222 116)"
      />
      <rect
        x="312"
        y="68"
        width="56"
        height="96"
        rx="28"
        fill="var(--modonty-reels-cutout, hsl(var(--background)))"
        transform="rotate(-35 340 116)"
      />
      <path
        d="M210 236C198 228 184 236 184 250V374C184 388 198 396 210 388L306 326C318 318 318 306 306 298Z"
        fill="var(--modonty-reels-cutout, hsl(var(--background)))"
      />
    </svg>
  );
}
