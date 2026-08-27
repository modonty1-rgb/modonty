import type { SVGProps } from "react";

/**
 * The modonty LOGOUT mark — تسجيل الخروج.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="logout"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: إطار خروج متناسق مع سهم متجه نحو الخارج ينطلق من ماسة الأمان المركزية.
 *
 * Category: Account / Auth · User sign-out, session termination
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-logout-body` · `--modonty-logout-accent` (the diamond).
 */
export function ModontyLogoutMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M58 24H34C28.5 24 24 28.5 24 34V86C24 91.5 28.5 96 34 96H58" stroke="var(--modonty-logout-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M50 60H96M96 60L80 44M96 60L80 76" stroke="var(--modonty-logout-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="43" y="53" width="14" height="14" rx="2" transform="rotate(45 50 60)" fill="var(--modonty-logout-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
