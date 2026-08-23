import type { SVGProps } from "react";

/**
 * The modonty EMAIL / NEWSLETTER mark — البريد الإلكتروني / النشرة.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="email"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: ظرف بريدي مغلق بحواف رقيقة وطية علوية محكمة بختم مدونتي الماسي.
 *
 * Category: Communication · Newsletter signup, contact email, direct messaging
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-email-body` · `--modonty-email-accent` (the diamond).
 */
export function ModontyEmailMark(props: SVGProps<SVGSVGElement>) {
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
      <rect x="22" y="30" width="76" height="60" rx="12" stroke="var(--modonty-email-body, currentColor)" strokeWidth="8"/>
      <path d="M26 36L56.5 58.5C58.5 60 61.5 60 63.5 58.5L94 36" stroke="var(--modonty-email-body, currentColor)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="63" width="14" height="14" rx="2" transform="rotate(45 60 70)" fill="var(--modonty-email-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
