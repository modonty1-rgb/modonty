import type { SVGProps } from "react";

/**
 * modonty's featured-partner mark: the «M» inside a gold scalloped medal, with a small
 * star above it (Khalid picked this over the plain medal, 2026-08-16).
 *
 * It is deliberately a different SHAPE and a different COLOUR from `ModontyTrustMark`:
 * the blue shield means «we checked his papers» and every partner carries it, while this
 * gold medal means «featured» and only the paying nine do. Two marks that differ on one
 * axis only would read as the same thing at 16px.
 *
 * Geometry notes: the medal is a 12-scallop circle (the shape visitors already read as
 * «verified» on global platforms). The star sits at the top and the M is pushed down and
 * scaled to 0.68 so the two never touch — the one risk of putting both in a 16px box.
 * Colours are fixed: this is a badge, not an interface icon.
 */
export function ModontyFeaturedMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="modonty-featured-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7C948" />
          <stop offset="1" stopColor="#D99A0B" />
        </linearGradient>
      </defs>
      <path
        fill="url(#modonty-featured-gold)"
        d="M50 10Q62.59 3 70 15.36Q84.41 15.59 84.64 30Q97 37.41 90 50Q97 62.59 84.64 70Q84.41 84.41 70 84.64Q62.59 97 50 90Q37.41 97 30 84.64Q15.59 84.41 15.36 70Q3 62.59 10 50Q3 37.41 15.36 30Q15.59 15.59 30 15.36Q37.41 3 50 10Z"
      />
      {/* The star reads first, so it stays whole and tight; the M carries the identity. */}
      <path fill="#4A3005" d="m50 21.5 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6-4.3-4.2 6-.9z" />
      <g transform="translate(50 56) scale(.68) translate(-50 -49.4)">
        <g transform="translate(0 -6)" fill="#4A3005">
          <path d="M74.41 50.23v24.42h-5.43V50.23c0-4.49-3.64-8.14-8.13-8.14-4.5 0-8.14 3.65-8.14 8.14v24.42h-5.42V50.23c0-4.49-3.65-8.14-8.14-8.14-4.5 0-8.14 3.65-8.14 8.14V63.8h-5.42V50.23c0-.92.09-1.83.27-2.72.4-2 1.25-3.84 2.44-5.42.77-1.02 1.68-1.93 2.72-2.71 2.26-1.7 5.08-2.72 8.14-2.72 3.05 0 5.86 1.01 8.14 2.72 1.02.76 1.93 1.68 2.71 2.71.77-1.02 1.68-1.93 2.72-2.71 2.27-1.7 5.08-2.72 8.14-2.72 3.05 0 5.86 1.01 8.13 2.72 1.03.76 1.95 1.68 2.72 2.71 1.18 1.58 2.03 3.42 2.45 5.42.18.89.28 1.8.28 2.72Z" />
          <rect x="25.59" y="69.22" width="5.42" height="5.42" transform="rotate(-45 28.3 71.93)" />
        </g>
      </g>
    </svg>
  );
}
