import type { SVGProps } from "react";

/**
 * The modonty TABLE OF CONTENTS mark — فهرس المحتويات.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="toc"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: أسطر قائمة فهرسية منظمة مسبوقة بنقاط تتابع ماسية تبرز منها النقطة النشطة بالسماوي.
 *
 * Category: Reader / Navigation · Article outline, section jump-list, table of contents
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-toc-body` · `--modonty-toc-accent` (the diamond).
 */
export function ModontyTocMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M52 36H94M52 60H94M52 84H94" stroke="var(--modonty-toc-body, currentColor)" strokeWidth="8" strokeLinecap="round"/>
      <rect x="27" y="29" width="14" height="14" rx="2" transform="rotate(45 34 36)" fill="var(--modonty-toc-body, currentColor)"/>
      <rect x="27" y="53" width="14" height="14" rx="2" transform="rotate(45 34 60)" fill="var(--modonty-toc-accent, hsl(var(--accent)))"/>
      <rect x="27" y="77" width="14" height="14" rx="2" transform="rotate(45 34 84)" fill="var(--modonty-toc-body, currentColor)"/>
    </svg>
  );
}
