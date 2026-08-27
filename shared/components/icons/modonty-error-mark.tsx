import type { SVGProps } from "react";

/**
 * The approved Modonty ERROR mark.
 *
 * Geometry is preserved verbatim from the approved 120 × 120 SVG supplied for
 * IconError. The optimization only converts SVG attributes to JSX, adopts the
 * shared 1em sizing contract, and exposes the approved body/accent colors as
 * CSS hooks. The body follows currentColor so existing error-state classes keep
 * working; the diamond keeps the approved cyan fallback.
 */
export function ModontyErrorMark(props: SVGProps<SVGSVGElement>) {
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
        d="M36 12H84L108 36V84L84 108H36L12 84V36L36 12Z"
        stroke="var(--modonty-error-body, currentColor)"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <rect
        x="54"
        y="30"
        width="12"
        height="44"
        rx="6"
        fill="var(--modonty-error-body, currentColor)"
      />
      <path
        d="M60 80L69 89L60 98L51 89L60 80Z"
        fill="var(--modonty-error-accent, #00D8D8)"
      />
    </svg>
  );
}
