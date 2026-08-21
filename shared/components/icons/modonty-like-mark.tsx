import type { SVGProps } from "react";

/**
 * The modonty LIKE mark — a solid raised hand with the brand diamond on the wrist
 * (supplied by Khalid, 21 Aug 2026). The hand takes `currentColor` so it stays legible
 * on any tab colour; the diamond keeps its cyan gradient and can be overridden with
 * `--modonty-like-accent` (e.g. `white` on a saturated button).
 *
 * NOTE — this mark is FILLED by nature, so it cannot express a liked/unliked toggle on
 * its own. Surfaces with a toggle (the article engagement tab, reel rail) still need an
 * outline twin before they can adopt it.
 *
 * The gradient id is fixed: several instances on one page emit identical `<defs>`, which
 * renders correctly (every `url(#…)` resolves to an identical gradient) but does repeat
 * the id. Pass `--modonty-like-accent` to skip the gradient entirely where that matters.
 */
export function ModontyLikeMark(props: SVGProps<SVGSVGElement>) {
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
      <defs>
        <linearGradient id="modontyLikeAccent" x1="58" y1="67" x2="80" y2="89" gradientUnits="userSpaceOnUse">
          <stop stopColor="#08C9EE" />
          <stop offset="1" stopColor="#00D8D8" />
        </linearGradient>
      </defs>
      <path
        fill="var(--modonty-like-body, currentColor)"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M73.75 11.88 L69.50 10.12 L65.25 10.12 L61.50 11.62 L59.75 13.12 L57.50 17.12 L57.00 22.88 L56.25 26.62 L54.75 31.12 L52.75 35.38 L46.50 44.88 L40.75 52.62 L39.00 54.38 L38.25 54.12 L37.75 52.88 L36.25 51.38 L33.00 50.12 L16.25 50.12 L13.50 51.12 L11.00 53.62 L10.25 55.88 L10.25 104.12 L11.25 106.62 L13.25 108.62 L16.75 109.88 L32.50 109.88 L35.75 108.88 L38.75 105.88 L45.00 108.62 L50.00 109.88 L90.75 109.88 L94.25 109.12 L96.75 107.88 L98.75 106.38 L100.75 103.88 L102.50 99.12 L102.25 94.38 L105.00 91.88 L106.75 88.62 L107.25 84.38 L106.00 79.62 L108.00 77.38 L109.00 75.38 L109.75 72.12 L109.25 67.62 L107.25 64.12 L108.50 62.12 L109.50 58.62 L109.50 55.38 L109.00 53.12 L107.00 49.38 L105.00 47.38 L100.00 44.88 L76.75 44.38 L80.25 28.62 L80.50 24.38 L79.75 19.88 L78.00 16.12 L76.25 13.88 Z M17.25 56.62 L32.00 56.62 L32.50 57.12 L32.50 102.88 L32.00 103.38 L17.25 103.38 L16.75 102.88 L16.75 57.12 Z M66.50 16.38 L68.25 16.38 L70.75 17.62 L73.00 20.38 L74.00 23.62 L74.00 26.88 L69.50 46.88 L70.00 49.38 L71.25 50.62 L72.50 51.12 L98.50 51.12 L101.25 52.62 L103.00 55.62 L102.75 59.12 L102.00 60.38 L99.25 62.88 L99.00 63.62 L99.50 65.88 L102.50 68.38 L103.25 70.12 L103.25 72.38 L102.50 74.12 L101.00 75.62 L99.00 76.62 L98.00 78.38 L98.25 80.12 L100.50 83.12 L100.75 86.12 L100.00 87.88 L98.25 89.62 L96.25 90.38 L95.25 91.38 L94.75 93.12 L96.00 95.88 L96.00 98.88 L95.00 100.88 L94.00 101.88 L91.75 103.12 L50.00 103.38 L46.00 102.12 L39.50 99.38 L38.75 98.62 L38.75 61.88 L42.75 59.88 L44.75 58.12 L53.50 46.38 L57.75 39.88 L60.50 34.12 L62.50 28.38 L63.50 23.62 L64.00 18.38 L65.00 17.12 Z"
      />
      <rect
        x="60.12"
        y="69.38"
        width="17"
        height="17"
        rx="2.2"
        transform="rotate(45 68.62 77.88)"
        fill="var(--modonty-like-accent, url(#modontyLikeAccent))"
      />
    </svg>
  );
}
