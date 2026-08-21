import type { SVGProps } from "react";

/**
 * The modonty BOOKING mark — a calendar whose date cells are modonty diamonds, with the
 * confirmed day as a large brand-cyan diamond carrying the check (Khalid's corrected
 * version, 21 Aug 2026). Same icon contract as the other modonty marks: `currentColor`
 * + `1em` box, three CSS hooks — `--modonty-booking-body` (frame, binders, small
 * diamonds) · `--modonty-booking-accent` (the confirmed day) ·
 * `--modonty-booking-check` (the tick inside it, white by default).
 */
export function ModontyBookingMark(props: SVGProps<SVGSVGElement>) {
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
      <rect
        x="20.62"
        y="23.30"
        width="78.56"
        height="78.84"
        rx="10.4"
        stroke="var(--modonty-booking-body, currentColor)"
        strokeWidth="3.92"
      />
      <path d="M20.62 40.63H99.18" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="3.92" />
      <rect x="36.65" y="15.02" width="5.74" height="16.45" rx="2.87" fill="var(--modonty-booking-body, currentColor)" />
      <rect x="77.51" y="15.02" width="5.65" height="16.45" rx="2.82" fill="var(--modonty-booking-body, currentColor)" />
      <rect x="31.52" y="49.94" width="7.48" height="7.48" rx="1.15" transform="rotate(45 35.26 53.68)" fill="var(--modonty-booking-body, currentColor)" />
      <rect x="80.90" y="49.99" width="7.48" height="7.48" rx="1.15" transform="rotate(45 84.64 53.73)" fill="var(--modonty-booking-body, currentColor)" />
      <rect x="31.56" y="86.06" width="7.40" height="7.40" rx="1.15" transform="rotate(45 35.26 89.76)" fill="var(--modonty-booking-body, currentColor)" />
      <rect x="80.94" y="86.06" width="7.40" height="7.40" rx="1.15" transform="rotate(45 84.64 89.76)" fill="var(--modonty-booking-body, currentColor)" />
      <rect x="46.10" y="57.87" width="27.70" height="27.70" rx="4.1" transform="rotate(45 59.95 71.72)" fill="var(--modonty-booking-accent, currentColor)" />
      <path
        d="M50.2 71.9L56.1 77.8L69.3 64.8"
        stroke="var(--modonty-booking-check, #FFFFFF)"
        strokeWidth="5.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
