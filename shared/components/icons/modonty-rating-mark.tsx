import type { SVGProps } from "react";

/**
 * The modonty RATING / STAR mark — التقييم / النجمة.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="rating"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: نجمة خماسية متناسقة الزوايا بحواف مدورة، تتوسطها ماسة الجودة السماوية.
 *
 * Category: Feedback / Quality · User review, 5-star scoring, product ratings
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-rating-body` · `--modonty-rating-accent` (the diamond).
 */
export function ModontyRatingMark(props: SVGProps<SVGSVGElement>) {
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
      <path d="M60 18L72.4 43.1L100 47.1L80 66.6L84.7 94L60 81L35.3 94L40 66.6L20 47.1L47.6 43.1L60 18Z" stroke="var(--modonty-rating-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="49" width="14" height="14" rx="2" transform="rotate(45 60 56)" fill="var(--modonty-rating-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
