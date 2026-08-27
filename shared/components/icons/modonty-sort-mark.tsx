import type { SVGProps } from "react";

/**
 * The modonty SORT mark — الترتيب والفرز.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="sort"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: سهمان متوازيان متعاكسان للفرز الصاعد والهابط، وبينهما ماسة التوازن والترتيب.
 *
 * Category: Utility / Data · Ascending/descending sorting, reorder items
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-sort-body` · `--modonty-sort-accent` (the diamond).
 */
export function ModontySortMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M42 94V26M42 26L30 38M42 26L54 38" stroke="var(--modonty-sort-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M78 26V94M78 94L66 82M78 94L90 82" stroke="var(--modonty-sort-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="53" width="14" height="14" rx="2" transform="rotate(45 60 60)" fill="var(--modonty-sort-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
