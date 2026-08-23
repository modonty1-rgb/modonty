import type { SVGProps } from "react";

/**
 * The modonty HOME mark — الرئيسية.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="home"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: سقف جمالوني متوازن بزاويا ناعمة، وقاعدة مستقيمة متينة يتوسط مدخلها ماسة مدونتي السماوية كنقطة ارتكاز وهوية.
 *
 * Category: Navigation · Main landing, dashboard home, root navigation
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-home-body` · `--modonty-home-accent` (the diamond).
 */
export function ModontyHomeMark(props: SVGProps<SVGSVGElement>) {
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
      <path d="M22 56L56.5 25.5C58.5 23.8 61.5 23.8 63.5 25.5L98 56" stroke="var(--modonty-home-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 52V92C32 96.4 35.6 100 40 100H80C84.4 100 88 96.4 88 92V52" stroke="var(--modonty-home-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="71" width="14" height="14" rx="2" transform="rotate(45 60 78)" fill="var(--modonty-home-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
