import type { SVGProps } from "react";

/**
 * The modonty LOGOUT mark — a door with the arrow leaving it and the brand diamond at
 * the threshold (Khalid's corrected version, 21 Aug 2026). The mirror of
 * `ModontyLoginMark`, whose arrow enters. Same icon contract: `currentColor` + `1em`
 * box, two CSS hooks — `--modonty-logout-body` (door + arrow) ·
 * `--modonty-logout-accent` (the diamond).
 */
export function ModontyLogoutMark(props: SVGProps<SVGSVGElement>) {
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
        d="M82 44 V36 C82 29.3726 76.6274 24 70 24 H36 C29.3726 24 24 29.3726 24 36 V84 C24 90.6274 29.3726 96 36 96 H70 C76.6274 96 82 90.6274 82 84 V76"
        stroke="var(--modonty-logout-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M54 60H102" stroke="var(--modonty-logout-body, currentColor)" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M88 46L102 60L88 74"
        stroke="var(--modonty-logout-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="40"
        y="68"
        width="14"
        height="14"
        rx="2.5"
        transform="rotate(45 47 75)"
        fill="var(--modonty-logout-accent, currentColor)"
      />
    </svg>
  );
}
