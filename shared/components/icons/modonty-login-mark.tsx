import type { SVGProps } from "react";

/**
 * The modonty LOGIN mark — تسجيل الدخول.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="login"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: إطار بوابة مفتوح وسهم اتجاهي يخترق المساحة للداخل مرتكزا على ماسة الانطلاق المضيئة.
 *
 * Category: Account / Auth · User sign-in, access authentication, enter portal
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-login-body` · `--modonty-login-accent` (the diamond).
 */
export function ModontyLoginMark(props: SVGProps<SVGSVGElement>) {
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
      <path d="M62 24H36C30.5 24 26 28.5 26 34V86C26 91.5 30.5 96 36 96H62" stroke="var(--modonty-login-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M46 60H94M94 60L78 44M94 60L78 76" stroke="var(--modonty-login-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="39" y="53" width="14" height="14" rx="2" transform="rotate(45 46 60)" fill="var(--modonty-login-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
