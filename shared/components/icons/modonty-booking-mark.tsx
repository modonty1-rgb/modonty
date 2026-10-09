import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty BOOKING mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-booking-body` · `--modonty-booking-accent` (the diamond).
 */
export function ModontyBookingMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="4.5" y="6.25" width="15" height="13.25" rx="2" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 10.5H19.5" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.25 16L8.5 17.25L10.75 15" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.65 13.28A0.5 0.5 0 0 1 15.35 13.28L17.12 15.05A0.5 0.5 0 0 1 17.12 15.75L15.35 17.52A0.5 0.5 0 0 1 14.65 17.52L12.88 15.75A0.5 0.5 0 0 1 12.88 15.05Z" fill="var(--modonty-booking-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="2.5" y="3.5" width="11" height="9.5" rx="2" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 2V4.5" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 2V4.5" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9.5L5 10.5L6.75 8.75" stroke="var(--modonty-booking-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.89 7.04A0.3 0.3 0 0 1 10.31 7.04L11.66 8.39A0.3 0.3 0 0 1 11.66 8.81L10.31 10.16A0.3 0.3 0 0 1 9.89 10.16L8.54 8.81A0.3 0.3 0 0 1 8.54 8.39Z" fill="var(--modonty-booking-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
