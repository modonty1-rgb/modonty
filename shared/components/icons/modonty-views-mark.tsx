import type { SVGProps } from "react";

/**
 * The modonty VIEWS / EYE mark — المشاهدات / عدد الزوار.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="views"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: محيط عين متناظر مع حلقة الحدقة، وبؤرة الإبصار المركزية هي ماسة مدونتي الفاقعة.
 *
 * Category: Analytics / Metrics · Post views count, impression metrics, eye visibility
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-views-body` · `--modonty-views-accent` (the diamond).
 */
export function ModontyViewsMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 60C30 36 90 36 104 60C90 84 30 84 16 60Z" stroke="var(--modonty-views-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="60" cy="60" r="16" stroke="var(--modonty-views-body, currentColor)" strokeWidth="6"/>
      <rect x="53" y="53" width="14" height="14" rx="2" transform="rotate(45 60 60)" fill="var(--modonty-views-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
