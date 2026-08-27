import type { SVGProps } from "react";

/**
 * The modonty BOOKING / CALENDAR mark — الحجوزات / المواعيد.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="booking"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: روزنامة مواعيد منظمة بخطوط أفقية واضحة ومثبتات علوية، ويوم الحجز المحدد يرمز له بالماسة السماوية.
 *
 * Category: Utility / Operations · Appointments, schedule management, reservations
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-booking-body` · `--modonty-booking-accent` (the diamond).
 */
export function ModontyBookingMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <rect x="22" y="28" width="76" height="74" rx="14" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40 18V30M80 18V30" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="8" strokeLinecap="round"/>
      <path d="M24 48H96" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="6" strokeLinecap="round"/>
      <rect x="53" y="66" width="14" height="14" rx="2" transform="rotate(45 60 73)" fill="var(--modonty-booking-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
