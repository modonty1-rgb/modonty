import type { SVGProps } from "react";

/**
 * The modonty HOME mark — an outlined house with the brand diamond in its gable
 * (supplied by Khalid, 21 Aug 2026). Same icon contract as the other modonty marks:
 * `currentColor` + `1em` box, two CSS hooks — `--modonty-home-body` (the house) ·
 * `--modonty-home-accent` (the diamond).
 */
export function ModontyHomeMark(props: SVGProps<SVGSVGElement>) {
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
        d="M24 62 L60 30 L96 62 H88 V96 C88 100.418 84.418 104 80 104 H72 V76 C72 71.582 68.418 68 64 68 H56 C51.582 68 48 71.582 48 76 V104 H40 C35.582 104 32 100.418 32 96 V62 H24"
        stroke="var(--modonty-home-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="52"
        y="44"
        width="16"
        height="16"
        rx="2.5"
        transform="rotate(45 60 52)"
        fill="var(--modonty-home-accent, currentColor)"
      />
    </svg>
  );
}
