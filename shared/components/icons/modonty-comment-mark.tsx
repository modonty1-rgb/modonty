import type { SVGProps } from "react";

/**
 * The modonty COMMENT mark — a speech bubble with two text lines and the brand diamond
 * on its lower-right (supplied by Khalid, 21 Aug 2026). The bubble takes `currentColor`
 * so it stays legible on any tab colour; the diamond keeps its cyan gradient and can be
 * overridden with `--modonty-comment-accent` (e.g. `white` on a saturated button).
 *
 * The gradient id is fixed: several instances on one page emit identical `<defs>`, which
 * renders correctly but repeats the id — pass the accent var to skip the gradient where
 * that matters.
 */
export function ModontyCommentMark(props: SVGProps<SVGSVGElement>) {
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
        <linearGradient id="modontyCommentAccent" x1="77" y1="61" x2="87" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#08C9EE" />
          <stop offset="1" stopColor="#00D8D8" />
        </linearGradient>
      </defs>
      <path
        fill="var(--modonty-comment-body, currentColor)"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.48 26.22 L18.85 29.28 L17.99 33.40 L18.18 73.59 L18.85 75.98 L19.90 78.18 L22.78 81.53 L26.22 83.64 L30.33 84.69 L30.33 94.83 L30.91 96.65 L32.73 98.47 L35.02 99.04 L36.36 98.85 L37.61 98.28 L55.41 84.50 L91.00 84.40 L94.07 83.44 L96.27 82.20 L98.47 80.29 L100.19 77.99 L101.34 75.50 L102.01 72.44 L102.01 32.54 L101.53 30.14 L100.29 27.18 L98.28 24.50 L95.69 22.39 L93.21 21.15 L90.05 20.38 L30.24 20.38 L27.85 20.86 L24.78 22.20 L22.68 23.73 Z M24.50 29.67 L27.18 26.89 L28.71 26.12 L31.10 25.55 L89.09 25.55 L91.48 26.12 L92.92 26.89 L94.83 28.61 L95.69 29.86 L96.56 31.87 L96.84 33.49 L96.84 71.48 L96.46 73.49 L95.50 75.50 L92.92 78.09 L91.39 78.85 L89.47 79.33 L53.78 79.43 L52.15 80.29 L35.69 93.01 L35.69 82.01 L35.22 80.48 L33.68 79.43 L29.57 79.23 L26.70 77.89 L24.40 75.41 L23.25 72.34 L23.16 33.78 L23.44 32.06 Z"
      />
      <rect x="35.69" y="41.24" width="46.32" height="5.26" rx="2.63" fill="var(--modonty-comment-body, currentColor)" />
      <rect x="35.69" y="56.75" width="31.96" height="5.26" rx="2.63" fill="var(--modonty-comment-body, currentColor)" />
      <rect
        x="76.75"
        y="61.39"
        width="9.75"
        height="9.75"
        rx="1.55"
        transform="rotate(45 81.625 66.265)"
        fill="var(--modonty-comment-accent, url(#modontyCommentAccent))"
      />
    </svg>
  );
}
