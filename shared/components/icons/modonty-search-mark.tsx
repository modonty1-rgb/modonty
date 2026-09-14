import type { SVGProps } from "react";

/**
 * The modonty SEARCH mark — البحث.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="search"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: عدسة استكشاف هندسية دائرية متناسقة، بمقبض مائل بزاوية 45° وبؤرة التقاط ماسية مشعة في مركز العدسة.
 *
 * Category: Utility / Exploration · Search bar, content filtering, query execution
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-search-body` · `--modonty-search-accent` (the diamond).
 */
export function ModontySearchMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <circle cx="52" cy="52" r="28" stroke="var(--modonty-search-body, currentColor)" strokeWidth="8" strokeLinecap="round"/>
      <path d="M72 72L96 96" stroke="var(--modonty-search-body, currentColor)" strokeWidth="8" strokeLinecap="round"/>
      <rect x="42" y="42" width="20" height="20" rx="4" transform="rotate(30 52 52)" fill="var(--modonty-search-accent, var(--modonty-accent, #00d8d8))"/>
    </svg>
  );
}
