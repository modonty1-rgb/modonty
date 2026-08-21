import type { SVGProps } from "react";

/**
 * The modonty SEARCH mark — lens + handle with the brand diamond inside the lens
 * (supplied by Khalid, 21 Aug 2026: «this for search»). Same icon contract as the
 * other modonty marks: `currentColor` + `1em` box, two CSS hooks —
 * `--modonty-search-body` (lens + handle) · `--modonty-search-accent` (the diamond).
 */
export function ModontySearchMark(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="52" cy="52" r="29" stroke="var(--modonty-search-body, currentColor)" strokeWidth="10" />
      <path d="M73 73L99 99" stroke="var(--modonty-search-body, currentColor)" strokeWidth="10" strokeLinecap="round" />
      <rect
        x="52"
        y="39"
        width="18"
        height="18"
        rx="3"
        transform="rotate(45 52 39)"
        fill="var(--modonty-search-accent, currentColor)"
      />
    </svg>
  );
}
