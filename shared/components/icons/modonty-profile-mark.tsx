import type { SVGProps } from "react";

/**
 * The modonty PROFILE / ACCOUNT mark — الملف الشخصي / الحساب.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="profile"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: صورة ظلية لهيكل الشخص عبر رأس دائري وقوس كتفين متناظر، تستقر في صدره ماسة الهوية الشخصية.
 *
 * Category: Navigation / Identity · User settings, account profile, author identity
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-profile-body` · `--modonty-profile-accent` (the diamond).
 */
export function ModontyProfileMark(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="60" cy="46" r="18" stroke="var(--modonty-profile-body, currentColor)" strokeWidth="8"/>
      <path d="M26 94C26 76 41 72 60 72C79 72 94 76 94 94" stroke="var(--modonty-profile-body, currentColor)" strokeWidth="8" strokeLinecap="round"/>
      <rect x="53" y="86" width="14" height="14" rx="2" transform="rotate(45 60 93)" fill="var(--modonty-profile-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
