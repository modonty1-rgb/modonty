import type { SVGProps } from "react";

/**
 * The modonty LOGIN mark — a door with the arrow entering it and the brand diamond at
 * the threshold (Khalid's corrected version, 21 Aug 2026). The twin of
 * `ModontyLogoutMark`, whose arrow leaves. Same icon contract: `currentColor` + `1em`
 * box, two CSS hooks — `--modonty-login-body` (door + arrow) ·
 * `--modonty-login-accent` (the diamond).
 */
export function ModontyLoginMark(props: SVGProps<SVGSVGElement>) {
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
        d="M38 44 V36 C38 29.3726 43.3726 24 50 24 H84 C90.6274 24 96 29.3726 96 36 V84 C96 90.6274 90.6274 96 84 96 H50 C43.3726 96 38 90.6274 38 84 V76"
        stroke="var(--modonty-login-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 60H60" stroke="var(--modonty-login-body, currentColor)" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M50 46L66 60L50 74"
        stroke="var(--modonty-login-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="68"
        y="68"
        width="14"
        height="14"
        rx="2.5"
        transform="rotate(45 75 75)"
        fill="var(--modonty-login-accent, currentColor)"
      />
    </svg>
  );
}
