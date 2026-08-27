import type { SVGProps } from "react";

/**
 * The modonty FILTER mark — الفلترة والتصفية.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="filter"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: قمع تصفية هندسي متدرج نحو الأسفل، تتوسطه ماسة التنقية كعنصر تصفية ذكي.
 *
 * Category: Utility / Search · Search filters, content sorting attributes
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-filter-body` · `--modonty-filter-accent` (the diamond).
 */
export function ModontyFilterMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M22 26H98L68 62V94L52 84V62L22 26Z" stroke="var(--modonty-filter-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="37" width="14" height="14" rx="2" transform="rotate(45 60 44)" fill="var(--modonty-filter-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
