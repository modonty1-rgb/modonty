import type { SVGProps } from "react";

/**
 * The approved Modonty play mark.
 *
 * Geometry is preserved from the approved 120 x 120 SVG supplied for
 * IconPlay. Optimization compacts equivalent path commands, adopts the shared
 * 1em sizing contract, and exposes body/accent CSS hooks while retaining the
 * approved cyan accent fallback.
 */
export function ModontyPlayMark(props: SVGProps<SVGSVGElement>) {
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
        d="M38.5 22C35.2 22 32.8 24.8 32.8 28.1v20.7c1.6 0 2.7.7 3.9 1.9l5.6 5.6c1.1 1.1 1.5 2.4 1.5 3.8 0 1.3-.5 2.3-1.5 3.3l-6.2 6.1C35.2 70.3 34.1 70.4 32.8 70.2v22.7c0 3.5 2.6 5.9 5.9 5.9 1.8 0 3.5-.5 5.2-1.6L94 64.9c1.8-1.2 2.7-3.1 2.7-5.6 0-2.2-1.1-4.1-3.2-5.5L43.2 23.1c-1.5-.7-3.1-1.1-4.7-1.1Z"
        fill="var(--modonty-play-body, currentColor)"
      />
      <rect
        x="27.3"
        y="53.7"
        width="11.6"
        height="11.6"
        rx="1.8"
        transform="rotate(45 33.1 59.5)"
        fill="var(--modonty-play-accent, #00D8D8)"
      />
    </svg>
  );
}
