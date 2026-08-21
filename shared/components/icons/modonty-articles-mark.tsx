import type { SVGProps } from "react";

/**
 * The modonty ARTICLES mark — an outlined page with text lines and the brand diamond as
 * its folded corner. Drawn in the family Khalid supplied (`viewBox 0 0 120 120`, stroke
 * width 8, rounded caps, one diamond) so it sits beside the industries · partner · reels
 * marks without looking borrowed; it stands in until an approved original replaces it.
 *
 * Same icon contract: `currentColor` + `1em` box, two CSS hooks —
 * `--modonty-articles-body` (page + lines) · `--modonty-articles-accent` (the diamond).
 */
export function ModontyArticlesMark(props: SVGProps<SVGSVGElement>) {
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
        d="M26 30 C26 25.582 29.582 22 34 22 H70 L94 46 V90 C94 94.418 90.418 98 86 98 H34 C29.582 98 26 94.418 26 90 Z"
        stroke="var(--modonty-articles-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M42 58H72" stroke="var(--modonty-articles-body, currentColor)" strokeWidth="8" strokeLinecap="round" />
      <path d="M42 76H62" stroke="var(--modonty-articles-body, currentColor)" strokeWidth="8" strokeLinecap="round" />
      <rect
        x="70"
        y="22"
        width="17"
        height="17"
        rx="3"
        transform="rotate(45 70 22)"
        fill="var(--modonty-articles-accent, currentColor)"
      />
    </svg>
  );
}
