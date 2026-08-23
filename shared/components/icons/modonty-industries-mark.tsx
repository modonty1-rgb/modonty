import type { SVGProps } from "react";

/**
 * The modonty industries mark — three equal gateways meeting around the modonty
 * diamond (approved by Khalid, 21 Aug 2026; source of truth:
 * `shared/assets/brand/modonty-industries-mark.svg`). Same icon contract as
 * `ModontyMark`: `currentColor` + `1em` box so it sits in any icon row at the same
 * visual size as the lucide icons beside it. The two CSS hooks
 * (`--modonty-industries-body` / `--modonty-industries-accent`) let a caller split
 * the gateways and the diamond into two colours; untouched, both follow the text.
 */
export function ModontyIndustriesMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <g
        stroke="var(--modonty-industries-body, currentColor)"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M35 30v-8a15 12 0 0 1 30 0v8" />
        <path d="M35 30v-8a15 12 0 0 1 30 0v8" transform="rotate(120 50 50)" />
        <path d="M35 30v-8a15 12 0 0 1 30 0v8" transform="rotate(240 50 50)" />
      </g>
      <rect
        x="42.5"
        y="42.5"
        width="15"
        height="15"
        fill="var(--modonty-industries-accent, hsl(var(--accent)))"
        transform="rotate(45 50 50)"
      />
    </svg>
  );
}
