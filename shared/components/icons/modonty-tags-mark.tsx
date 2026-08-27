import type { SVGProps } from "react";

/**
 * The modonty TAGS mark — الوسوم / الكلمات المفتاحية.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="tags"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: بطاقة وسوم مائلة بفتحة تعليق واضحة، تتوسطها ماسة التمييز كعلامة وسم تفاعلية.
 *
 * Category: Content Organization · Article tags, keywords filter, indexing
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-tags-body` · `--modonty-tags-accent` (the diamond).
 */
export function ModontyTagsMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M26 62V34C26 29.6 29.6 26 34 26H62L96 60C99.2 63.2 99.2 68.8 96 72L72 96C68.8 99.2 63.2 99.2 60 96L26 62Z" stroke="var(--modonty-tags-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="44" cy="44" r="6" fill="var(--modonty-tags-body, currentColor)"/>
      <rect x="65" y="65" width="14" height="14" rx="2" transform="rotate(45 72 72)" fill="var(--modonty-tags-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
