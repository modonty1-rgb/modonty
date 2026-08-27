import { useId, type SVGProps } from "react";

/**
 * The approved Modonty close mark.
 *
 * Geometry is preserved from the approved 120 x 120 SVG supplied for
 * IconClose. The mask keeps the intentional clear space around the center
 * diamond; useId prevents collisions when several marks render on one page.
 */
export function ModontyCloseMark(props: SVGProps<SVGSVGElement>) {
  const centerGapId = useId();

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <mask
          id={centerGapId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="120"
          height="120"
        >
          <rect width="120" height="120" fill="white" />
          <rect
            x="51"
            y="51"
            width="18"
            height="18"
            rx="2.5"
            transform="rotate(45 60 60)"
            fill="black"
          />
        </mask>
      </defs>
      <g
        stroke="var(--modonty-close-body, currentColor)"
        strokeWidth="12.2"
        strokeLinecap="round"
        mask={`url(#${centerGapId})`}
      >
        <path d="M25.4 25.4 94.6 94.6" />
        <path d="M94.6 25.4 25.4 94.6" />
      </g>
      <rect
        x="54"
        y="54"
        width="12"
        height="12"
        rx="2"
        transform="rotate(45 60 60)"
        fill="var(--modonty-close-accent, #00D8D8)"
      />
    </svg>
  );
}
