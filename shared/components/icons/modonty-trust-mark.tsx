import type { SVGProps } from "react";

/**
 * modonty's official verification mark: the «M» inside a shield. Same geometry and brand
 * colours as `modonty/public/images/homepage/modonty-trust-shield.svg`, as a component so
 * every app (modonty · admin · console) draws the one mark at any size — bullets, badges,
 * partner cards — without shipping an <img> for each. Colours are fixed on purpose: this
 * is a badge, not an interface icon, so it must look identical everywhere.
 */
export function ModontyTrustMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path fill="#0B0A5C" stroke="#00D8D8" strokeWidth="3" d="M50 5 86 19v29c0 23-13 39-36 48C27 87 14 71 14 48V19L50 5Z" />
      <g transform="translate(0 -6)">
        <path fill="#F3F3F3" d="M74.41 50.23v24.42h-5.43V50.23c0-4.49-3.64-8.14-8.13-8.14-4.5 0-8.14 3.65-8.14 8.14v24.42h-5.42V50.23c0-4.49-3.65-8.14-8.14-8.14-4.5 0-8.14 3.65-8.14 8.14V63.8h-5.42V50.23c0-.92.09-1.83.27-2.72.4-2 1.25-3.84 2.44-5.42.77-1.02 1.68-1.93 2.72-2.71 2.26-1.7 5.08-2.72 8.14-2.72 3.05 0 5.86 1.01 8.14 2.72 1.02.76 1.93 1.68 2.71 2.71.77-1.02 1.68-1.93 2.72-2.71 2.27-1.7 5.08-2.72 8.14-2.72 3.05 0 5.86 1.01 8.13 2.72 1.03.76 1.95 1.68 2.72 2.71 1.18 1.58 2.03 3.42 2.45 5.42.18.89.28 1.8.28 2.72Z" />
        <rect x="25.59" y="69.22" width="5.42" height="5.42" fill="#00D8D8" transform="rotate(-45 28.3 71.93)" />
      </g>
    </svg>
  );
}
