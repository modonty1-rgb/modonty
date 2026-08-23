import type { SVGProps } from "react";

/**
 * The modonty WHATSAPP / LIVE CHAT mark — واتساب / المحادثة الفورية.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="whatsapp"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: فقاعة اتصال فورية مستديرة بذيل ناعم، تحتضن نبضة الاتصال الماسية النشطة.
 *
 * Category: Communication / Instant Messaging · WhatsApp chat button, live messaging, customer support
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-whatsapp-body` · `--modonty-whatsapp-accent` (the diamond).
 */
export function ModontyWhatsappMark(props: SVGProps<SVGSVGElement>) {
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
      <path d="M60 22C39 22 22 39 22 60C22 67.5 24.2 74.5 28 80.5L24 98L42 94C47.5 97 53.5 98 60 98C81 98 98 81 98 60C98 39 81 22 60 22Z" stroke="var(--modonty-whatsapp-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="53" width="14" height="14" rx="2" transform="rotate(45 60 60)" fill="var(--modonty-whatsapp-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
