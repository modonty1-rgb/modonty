import type { SVGProps } from "react";

/**
 * The approved Modonty loading mark.
 *
 * Geometry is preserved from the approved 120 x 120 SVG supplied for
 * IconLoading. Optimization removes authoring metadata, adopts the shared 1em
 * sizing contract, converts SVG attributes to JSX, and exposes body/accent CSS
 * hooks while retaining the approved cyan accent fallback.
 */
export function ModontyLoadingMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <g
        stroke="var(--modonty-loading-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
      >
        <path d="M30 32 A38 38 0 0 1 56 23" />
        <path d="M27 42 A38 38 0 0 0 43 94" />
        <path d="M50 96 A38 38 0 0 0 94 43" />
      </g>
      <rect
        x="69"
        y="25"
        width="14"
        height="14"
        rx="2.5"
        transform="rotate(45 76 32)"
        fill="var(--modonty-loading-accent, #00D8D8)"
      />
    </svg>
  );
}
