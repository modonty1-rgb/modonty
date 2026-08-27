import type { SVGProps } from "react";

/**
 * The modonty NOTIFICATIONS mark — الإشعارات / التنبيهات.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="notifications"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: جرس تنبيه كلاسيكي واضح مع تطبيقين للماسة: ماسة مفرغة كعلامة وصول جديد، وماسة ممتلئة كلسان الرنين.
 *
 * Category: Brand / Utility · System alerts, new updates, unread messages
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-notifications-body` · `--modonty-notifications-accent` (the diamond).
 */
export function ModontyNotificationsMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <circle cx="60" cy="17" r="6" fill="var(--modonty-notifications-body, currentColor)"/>
      <path d="M78 31C72 25 65 22 58 22C43 22 32 32 30 47L28 68C27 78 24 83 18 88C14 91 16 99 22 99H98C104 99 106 91 102 88C96 83 93 78 92 68L90 48" stroke="var(--modonty-notifications-body, currentColor)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="83" y="29" width="14" height="14" rx="2" transform="rotate(45 90 36)" fill="#FFFFFF" stroke="var(--modonty-notifications-accent, hsl(var(--accent)))" strokeWidth="5"/>
      <rect x="53" y="101" width="14" height="14" rx="2" transform="rotate(45 60 108)" fill="var(--modonty-notifications-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
