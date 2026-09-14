import type { SVGProps } from "react";

/**
 * The modonty LOCATION / PIN mark — الموقع الجغرافي / الخريطة.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="location"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: دبوس خريطة انسيابي بقوس علوي واسع وذيل مدبب، وبؤرة الإحداثيات هي ماسة مدونتي المركزية.
 *
 * Category: Utility / Maps · Store locator, event venue, address pin
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-location-body` · `--modonty-location-accent` (the diamond).
 */
export function ModontyLocationMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M60 102C60 102 88 68 88 48C88 32.5 75.5 20 60 20C44.5 20 32 32.5 32 48C32 68 60 102 60 102Z" stroke="var(--modonty-location-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="50" y="38" width="20" height="20" rx="4" transform="rotate(30 60 48)" fill="var(--modonty-location-accent, var(--modonty-accent, #00d8d8))"/>
    </svg>
  );
}
