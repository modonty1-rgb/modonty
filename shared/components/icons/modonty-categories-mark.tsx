import type { SVGProps } from "react";

/**
 * The modonty CATEGORIES / INDUSTRIES mark — التصنيفات / القطاعات.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="categories"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: شبكة من 4 وحدات هندسية مدورة الزوايا، تتميز الوحدة الرابعة بتحولها لماسة مدونتي النشطة.
 *
 * Category: Navigation / Structure · Sector directories, topics index, categories grid
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-categories-body` · `--modonty-categories-accent` (the diamond).
 */
export function ModontyCategoriesMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <rect x="22" y="22" width="30" height="30" rx="8" stroke="var(--modonty-categories-body, currentColor)" strokeWidth="8"/>
      <rect x="68" y="22" width="30" height="30" rx="8" stroke="var(--modonty-categories-body, currentColor)" strokeWidth="8"/>
      <rect x="22" y="68" width="30" height="30" rx="8" stroke="var(--modonty-categories-body, currentColor)" strokeWidth="8"/>
      <rect x="76" y="76" width="14" height="14" rx="2" transform="rotate(45 83 83)" fill="var(--modonty-categories-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
