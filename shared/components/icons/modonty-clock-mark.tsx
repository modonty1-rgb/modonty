import type { SVGProps } from "react";

/**
 * The modonty CLOCK / TIME mark — الساعة / الوقت.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="clock"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: ميناء ساعة دائري نقي بعقارب ساعات ودقائق متناسقة، يربط ارتكازها ماسة الوقت المركزية.
 *
 * Category: Utility / Scheduling · Reading time estimation, office hours, timestamps
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-clock-body` · `--modonty-clock-accent` (the diamond).
 */
export function ModontyClockMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <circle cx="60" cy="60" r="42" stroke="var(--modonty-clock-body, currentColor)" strokeWidth="8"/>
      <path d="M60 32V60L78 68" stroke="var(--modonty-clock-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="53" y="53" width="14" height="14" rx="2" transform="rotate(45 60 60)" fill="var(--modonty-clock-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
