import type { SVGProps } from "react";

/**
 * The modonty DIRECTIONS / NAVIGATION mark — الاتجاهات / المسار.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="directions"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: لوحة توجيه طرقية معينة الإطار، ومسار سهمي ينعطف نحو الوجهة منطلقا من ماسة البداية.
 *
 * Category: Maps / Guidance · Turn-by-turn navigation, route finding, directions
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-directions-body` · `--modonty-directions-accent` (the diamond).
 */
export function ModontyDirectionsMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <rect x="30" y="30" width="60" height="60" rx="10" transform="rotate(45 60 60)" stroke="var(--modonty-directions-body, currentColor)" strokeWidth="8"/>
      <path d="M46 72V52C46 47.6 49.6 44 54 44H74M74 44L64 34M74 44L64 54" stroke="var(--modonty-directions-body, currentColor)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="39" y="65" width="14" height="14" rx="2" transform="rotate(45 46 72)" fill="var(--modonty-directions-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
