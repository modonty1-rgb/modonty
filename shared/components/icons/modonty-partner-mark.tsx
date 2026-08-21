import type { SVGProps } from "react";

/**
 * The modonty PARTNER mark — the «M» with the diamond above it (supplied by Khalid,
 * 21 Aug 2026: «keep this as icon for partner»). Same icon contract as `ModontyMark`
 * and `ModontyIndustriesMark`: `currentColor` + `1em` box, with two CSS hooks so a
 * caller can split the M and the diamond into two colours:
 * `--modonty-partner-body` (the M) · `--modonty-partner-accent` (the diamond).
 */
export function ModontyPartnerMark(props: SVGProps<SVGSVGElement>) {
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
      {/* Rotation origin at x=60 — the M's own centre line — so the diamond sits dead
          centre above it (Khalid, 21 Aug: it rendered shifted to one side). */}
      <rect
        x="60"
        y="10"
        width="22"
        height="22"
        rx="4"
        transform="rotate(45 60 10)"
        fill="var(--modonty-partner-accent, currentColor)"
      />
      <path
        d="M18 94 V57 C18 49 26 45 32 51 L52 71 C57 76 63 76 68 71 L88 51 C94 45 102 49 102 57 V94"
        stroke="var(--modonty-partner-body, currentColor)"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
