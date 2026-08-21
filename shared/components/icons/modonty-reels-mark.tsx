import type { SVGProps } from "react";

/**
 * The modonty REELS mark — a rounded frame opening at the top corner where the brand
 * diamond sits, play triangle inside (supplied by Khalid, 21 Aug 2026: «this for
 * reels»). Same icon contract as the partner/industries marks: `currentColor` + `1em`
 * box, two CSS hooks — `--modonty-reels-body` (frame + play) ·
 * `--modonty-reels-accent` (the diamond).
 */
export function ModontyReelsMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M87 30 H46 C32 30 24 38 24 52 V84 C24 96 32 104 44 104 H80 C92 104 100 96 100 84 V52"
        stroke="var(--modonty-reels-body, currentColor)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52 51 L78 67 L52 83 Z"
        fill="var(--modonty-reels-body, currentColor)"
        stroke="var(--modonty-reels-body, currentColor)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect
        x="91"
        y="23"
        width="17"
        height="17"
        rx="3.5"
        transform="rotate(45 91 23)"
        fill="var(--modonty-reels-accent, currentColor)"
      />
    </svg>
  );
}
