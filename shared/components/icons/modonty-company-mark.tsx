import type { SVGProps } from "react";

/**
 * The modonty COMPANY / BUILDING mark — الشركة / المؤسسة.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="company"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: مبنى مؤسسي شامخ بنوافذ هندسية منظمة، ومدخله الرئيسي مصمم بماسة مدونتي الترحيبية.
 *
 * Category: Organization / Enterprise · Enterprise profile, company info, headquarters address
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-company-body` · `--modonty-company-accent` (the diamond).
 */
export function ModontyCompanyMark(props: SVGProps<SVGSVGElement>) {
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
      <rect x="30" y="22" width="60" height="78" rx="8" stroke="var(--modonty-company-body, currentColor)" strokeWidth="8"/>
      <rect x="42" y="36" width="10" height="10" rx="2" fill="var(--modonty-company-body, currentColor)"/>
      <rect x="68" y="36" width="10" height="10" rx="2" fill="var(--modonty-company-body, currentColor)"/>
      <rect x="42" y="54" width="10" height="10" rx="2" fill="var(--modonty-company-body, currentColor)"/>
      <rect x="68" y="54" width="10" height="10" rx="2" fill="var(--modonty-company-body, currentColor)"/>
      <rect x="53" y="77" width="14" height="14" rx="2" transform="rotate(45 60 84)" fill="var(--modonty-company-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
