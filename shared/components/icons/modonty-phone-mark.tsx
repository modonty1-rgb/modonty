import type { SVGProps } from "react";

/**
 * The modonty PHONE mark — الهاتف / الاتصال.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="phone"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: سماعة هاتف كلاسيكية متقنة الانحناء تنبثق من أعلاها إشارة اتصال لاسلكية ماسية.
 *
 * Category: Communication · Direct phone call, customer hotline, telephone contact
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-phone-body` · `--modonty-phone-accent` (the diamond).
 */
export function ModontyPhoneMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M34 26C30 26 24 32 24 38C24 68 52 96 82 96C88 96 94 90 94 86L86 68C84 64 78 62 74 64L66 70C54 62 48 54 42 42L48 34C50 30 48 24 44 22L34 26Z" stroke="var(--modonty-phone-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="67" y="27" width="14" height="14" rx="2" transform="rotate(45 74 34)" fill="var(--modonty-phone-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
