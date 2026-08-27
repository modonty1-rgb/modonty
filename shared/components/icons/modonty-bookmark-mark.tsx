import type { SVGProps } from "react";

/**
 * The modonty BOOKMARK mark — حفظ المقال / الإشارات المرجعية.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="bookmark"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: شريط إشارة مرجعية كلاسيكي بقطع سفلي متقن، تعلوه ماسة التمييز كعلامة حفظ نشطة.
 *
 * Category: Utility / Reader · Save for later, bookmarks library, reading list
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-bookmark-body` · `--modonty-bookmark-accent` (the diamond).
 */
export function ModontyBookmarkMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M34 26C34 21.6 37.6 18 42 18H78C82.4 18 86 21.6 86 26V100L60 82L34 100V26Z" stroke="var(--modonty-bookmark-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="39" width="14" height="14" rx="2" transform="rotate(45 60 46)" fill="var(--modonty-bookmark-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
