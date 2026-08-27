import type { SVGProps } from "react";

/**
 * The approved Modonty information mark.
 *
 * Geometry is preserved from the approved 120 x 120 SVG supplied for
 * IconInfo. Optimization adopts the shared 1em sizing contract, converts SVG
 * attributes to JSX, and exposes body/accent CSS hooks while retaining the
 * approved cyan accent fallback.
 */
export function ModontyInfoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="60"
        cy="59.4"
        r="43.7"
        stroke="var(--modonty-info-body, currentColor)"
        strokeWidth="4.7"
      />
      <path
        d="M60 52.3V84.4"
        stroke="var(--modonty-info-body, currentColor)"
        strokeWidth="8.1"
        strokeLinecap="round"
      />
      <rect
        x="54.9"
        y="32.7"
        width="10.2"
        height="10.2"
        rx="1.5"
        transform="rotate(45 60 37.8)"
        fill="var(--modonty-info-accent, #00D8D8)"
      />
    </svg>
  );
}
