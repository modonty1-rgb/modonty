import type { SVGProps } from "react";

/**
 * The modonty ARTICLE mark — a written piece: the articles tab, and the empty frame a
 * card falls back to when an article has no cover.
 *
 * NOT in the approved 38 — "Article / Newspaper" sits on the master reference's own
 * missing list — so it is drawn to the file's Geometry Standard rather than traced:
 * 120 canvas · 8px main stroke · 7px for the text lines, which the standard allows for
 * secondary detail · round caps and joins · inside the 16px safe margin. Redrawn 22 Aug
 * 2026 from an earlier stroke-8-on-a-different-grid version that predated the standard.
 *
 * The diamond is the folded corner, not a badge stuck on a page: the fold is where a page
 * turns, and the reference asks the diamond to be "a functional node… or core branding
 * focal point" rather than an ornament laid on top.
 *
 * TWO text lines, not three or four. The standard forbids detail that collapses at small
 * sizes ("No micro-lines that collapse below 18px render resolution"), and this mark ships
 * at 20px on a feed card.
 *
 * Contract: `currentColor` + a `1em` box, two CSS hooks — `--modonty-articles-body` ·
 * `--modonty-articles-accent` (the folded corner).
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
        d="M34 22H70L94 46V90C94 94.4 90.4 98 86 98H34C29.6 98 26 94.4 26 90V30C26 25.6 29.6 22 34 22Z"
        stroke="var(--modonty-articles-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M42 60H72M42 78H62"
        stroke="var(--modonty-articles-body, currentColor)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect
        x="63"
        y="15"
        width="14"
        height="14"
        rx="2"
        transform="rotate(45 70 22)"
        fill="var(--modonty-articles-accent, hsl(var(--accent)))"
      />
    </svg>
  );
}
