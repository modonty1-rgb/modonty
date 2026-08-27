import type { SVGProps } from "react";

/**
 * The modonty SUPPORT / HELPDESK mark — الدعم الفني / المساعدة.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="support"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: سماعة خدمة عملاء محيطة بالرأس، وميكروفون متصل بماسة التحدث واستقبال الاستفسارات.
 *
 * Category: Customer Care · Customer service, helpdesk ticket, technical assistance
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-support-body` · `--modonty-support-accent` (the diamond).
 */
export function ModontySupportMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M26 62C26 43.2 41.2 28 60 28C78.8 28 94 43.2 94 62V78C94 82.4 90.4 86 86 86H80" stroke="var(--modonty-support-body, currentColor)" strokeWidth="8" strokeLinecap="round"/>
      <rect x="20" y="56" width="12" height="24" rx="4" fill="var(--modonty-support-body, currentColor)"/>
      <rect x="88" y="56" width="12" height="24" rx="4" fill="var(--modonty-support-body, currentColor)"/>
      <path d="M86 86V88C86 94 80 98 74 98H68" stroke="var(--modonty-support-body, currentColor)" strokeWidth="6" strokeLinecap="round"/>
      <rect x="51" y="89" width="14" height="14" rx="2" transform="rotate(45 58 96)" fill="var(--modonty-support-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
