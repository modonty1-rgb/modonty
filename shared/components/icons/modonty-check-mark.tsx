import type { SVGProps } from "react";

/**
 * The approved Modonty check mark.
 *
 * Geometry is preserved from the approved 120 x 120 SVG supplied for
 * IconCheck. Optimization compacts equivalent path commands, adopts the shared
 * 1em sizing contract, and exposes body/accent CSS hooks while retaining the
 * approved cyan accent fallback.
 */
export function ModontyCheckMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <g fill="var(--modonty-check-body, currentColor)">
        <path d="M14.34 55.86 13.08 56.94 12.18 58.56v.54l-.18.18v1.8l.18.18v.54l.9 1.62.36.36h.18l.36.36v.18l.54.54h.18l.36.36v.18l2.52 2.52h.18l.18.37 19.1 18.91 7.02-7.03v-.18L20.11 56.04l-1.09-.54-1.08-.18-.18-.18h-1.44l-.18.18h-.54l-.18.18h-.36Z" />
        <path d="M106.2 26.5h-.18l-.72-.54-1.08-.18-.18-.18h-1.62l-.18.18-1.08.18-.72.54h-.18L47.12 79.81v.18l6.85 6.85h.18L80.08 60.9v-.18l.36-.36h.18l2.16-2.16v-.18l1.27-1.26.36-.18.18-.36.36-.18v-.18l19.63-19.63v-.18l2.7-2.71.54-1.08v-.36l.18-.18.18-1.62-.18-.18v-.72l-.18-.18v-.36l-.54-1.08Z" />
      </g>
      <path
        fill="var(--modonty-check-accent, #00D8D8)"
        d="m45.32 81.61-.18.18h-.36l-2.88 2.89v.18l-.54.54h-.18v.18l-1.08 1.08-.36.18-.36.72v1.08l.18.36 4.32 4.32v.18l.36.36h.18l.72.54h1.08l.36-.18L51.8 89v-.36l.18-.18v-.9l-.18-.36-5.4-5.41Z"
      />
    </svg>
  );
}
