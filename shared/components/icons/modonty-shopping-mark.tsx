import type { SVGProps } from "react";

/**
 * The modonty SHOPPING mark — a solid cart with the brand diamond riding in its basket
 * (Khalid's corrected version, 21 Aug 2026). Same icon contract as the other modonty
 * marks: `currentColor` + `1em` box, two CSS hooks — `--modonty-shopping-body`
 * (cart + wheels) · `--modonty-shopping-accent` (the diamond).
 *
 * The wheel hubs are painted with `--modonty-shopping-hub`, which defaults to the page
 * background so the hub reads as a hole rather than a white dot on a coloured button.
 */
export function ModontyShoppingMark(props: SVGProps<SVGSVGElement>) {
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
        fill="var(--modonty-shopping-body, currentColor)"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.40 17.78 L10.00 18.59 L10.00 20.20 L10.40 21.01 L11.62 21.82 L28.99 21.82 L30.81 22.63 L32.22 24.24 L44.34 71.11 L42.32 73.33 L41.11 76.57 L41.11 79.19 L41.52 80.61 L42.53 82.42 L43.94 83.84 L47.17 85.25 L100.10 85.25 L101.52 84.04 L101.72 82.22 L101.31 81.41 L99.90 80.40 L47.98 80.40 L46.36 79.19 L45.96 77.17 L46.57 75.96 L47.98 74.95 L95.25 74.95 L98.69 73.54 L100.51 71.72 L101.72 69.09 L109.80 37.58 L109.80 34.55 L109.39 33.13 L107.17 30.30 L103.94 28.89 L38.89 28.89 L38.48 28.48 L37.27 23.43 L36.26 21.21 L33.84 18.59 L31.41 17.37 L30.00 16.97 L11.62 16.97 Z M39.90 33.94 L103.74 33.94 L104.95 35.35 L104.95 36.57 L96.87 68.28 L95.66 69.70 L94.65 70.10 L50.40 70.10 L49.60 69.70 L48.59 68.28 Z"
      />
      <circle cx="55.45" cy="95.45" r="7.58" fill="var(--modonty-shopping-body, currentColor)" />
      <circle cx="55.45" cy="95.45" r="2.83" fill="var(--modonty-shopping-hub, hsl(var(--background)))" />
      <circle cx="89.90" cy="95.45" r="7.58" fill="var(--modonty-shopping-body, currentColor)" />
      <circle cx="89.90" cy="95.45" r="2.83" fill="var(--modonty-shopping-hub, hsl(var(--background)))" />
      <rect
        x="81.75"
        y="49.35"
        width="10.30"
        height="10.30"
        rx="1.45"
        transform="rotate(45 86.90 54.50)"
        fill="var(--modonty-shopping-accent, currentColor)"
      />
    </svg>
  );
}
