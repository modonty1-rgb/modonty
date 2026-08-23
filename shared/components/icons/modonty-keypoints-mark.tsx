import type { SVGProps } from "react";

/**
 * The modonty KEY POINTS / LIGHTNING mark — النقاط الجوهرية / الخلاصة.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="keypoints"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: وميض كهربائي خاطف بخطوط 45° حادة متناسقة، تتوسطه شارة التركيز الماسية.
 *
 * Category: Content / Highlights · Summary takeaways, lightning highlights, quick tips
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-keypoints-body` · `--modonty-keypoints-accent` (the diamond).
 */
export function ModontyKeypointsMark(props: SVGProps<SVGSVGElement>) {
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
      <path d="M66 18L34 62H62L54 102L86 54H58L66 18Z" stroke="var(--modonty-keypoints-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="53" width="14" height="14" rx="2" transform="rotate(45 60 60)" fill="var(--modonty-keypoints-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
