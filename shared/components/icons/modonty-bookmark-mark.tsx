import type { SVGProps } from "react";

/**
 * The modonty BOOKMARK mark — an outlined ribbon with the brand diamond in its face
 * (supplied by Khalid, 21 Aug 2026). Same icon contract as the other modonty marks:
 * `currentColor` + `1em` box, two CSS hooks — `--modonty-bookmark-body` (the ribbon) ·
 * `--modonty-bookmark-accent` (the diamond).
 *
 * The ribbon is drawn as an outline via `fill-rule="evenodd"`, so a «saved» state can be
 * expressed by filling the whole mark: pass `--modonty-bookmark-accent` the body colour.
 */
export function ModontyBookmarkMark(props: SVGProps<SVGSVGElement>) {
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
        fill="var(--modonty-bookmark-body, currentColor)"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.65 7.58 L12.26 10.08 L11.50 11.17 L10.30 13.45 L9.54 15.95 L9.21 18.56 L9.21 104.92 L9.43 106.77 L10.08 108.83 L10.84 110.24 L11.93 111.76 L14.32 113.94 L16.06 114.91 L17.90 115.57 L20.95 115.89 L23.45 115.46 L25.07 114.81 L32.57 109.92 L42.89 102.86 L59.73 90.80 L60.16 90.80 L93.08 114.15 L95.03 115.13 L97.53 115.78 L100.57 115.78 L103.29 115.02 L105.25 114.04 L106.55 113.07 L108.07 111.55 L109.37 109.70 L109.92 108.61 L110.68 105.79 L110.68 17.36 L109.81 13.67 L108.94 11.82 L107.31 9.43 L105.46 7.58 L103.07 5.96 L100.03 4.65 L96.99 4.00 L23.34 4.00 L21.71 4.22 L18.77 5.09 L16.60 6.17 Z M19.21 12.47 L21.06 11.39 L23.34 10.74 L96.77 10.74 L98.51 11.17 L100.03 11.93 L102.31 13.99 L103.40 15.84 L103.94 18.01 L103.94 105.03 L103.72 106.22 L103.29 107.20 L101.99 108.72 L100.68 109.48 L99.49 109.81 L97.75 109.81 L96.01 109.16 L64.07 85.80 L62.23 84.71 L60.81 84.39 L59.08 84.39 L57.01 85.04 L39.52 97.75 L23.45 108.94 L21.82 109.59 L19.97 109.59 L18.67 109.16 L17.14 107.96 L16.38 106.77 L16.06 105.68 L16.06 17.80 L16.38 16.38 L17.04 14.97 L17.69 13.99 Z"
      />
      <path
        fill="var(--modonty-bookmark-accent, currentColor)"
        d="M59.29 45.61 L58.42 45.82 L57.45 46.37 L49.08 54.51 L48.43 56.03 L48.43 57.77 L49.19 59.40 L57.01 67.22 L58.32 68.09 L59.51 68.42 L60.38 68.42 L62.23 67.77 L70.81 59.29 L71.46 57.77 L71.46 56.03 L70.70 54.41 L62.44 46.37 L60.71 45.61 Z"
      />
    </svg>
  );
}
