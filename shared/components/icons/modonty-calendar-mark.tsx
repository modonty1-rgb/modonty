import type { SVGProps } from "react";

/**
 * The modonty CALENDAR mark — a publish date, «نُشر في…», any plain point in time.
 *
 * NOT the approved `booking` mark, and the difference is the whole reason this exists:
 * `booking` is "Calendar + Confirm" — a calendar with a check inside, which says «موعد
 * محجوز». Putting that on an article's publish date would promise the reader a booking.
 * Same silhouette, different statement.
 *
 * Drawn to the file's Geometry Standard rather than traced (the approved 38 have no plain
 * calendar): 120 canvas · 8px main stroke · 6px for the hangers, which the standard allows
 * for secondary detail · round caps and joins · inside the 16px safe margin.
 *
 * The diamond IS the marked day, not an ornament — the reference's own note on the
 * calendar family: "نقاط الأيام يمكن أن تتحول إلى Diamond geometry", and its Diamond Role
 * rule: "a functional node, status marker, central trigger". It is the one day this
 * calendar is about.
 *
 * Contract: `currentColor` + a `1em` box, two CSS hooks — `--modonty-calendar-body` ·
 * `--modonty-calendar-accent` (the day).
 */
export function ModontyCalendarMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M30 30H90C94.4 30 98 33.6 98 38V90C98 94.4 94.4 98 90 98H30C25.6 98 22 94.4 22 90V38C22 33.6 25.6 30 30 30Z"
        stroke="var(--modonty-calendar-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 52H98"
        stroke="var(--modonty-calendar-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M42 20V38M78 20V38"
        stroke="var(--modonty-calendar-body, currentColor)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect
        x="50"
        y="65"
        width="20"
        height="20"
        rx="4"
        transform="rotate(30 60 75)"
        fill="var(--modonty-calendar-accent, var(--modonty-accent, #00d8d8))"
      />
    </svg>
  );
}
