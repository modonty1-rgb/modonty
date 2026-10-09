import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty CALENDAR mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-calendar-body` · `--modonty-calendar-accent` (the diamond).
 */
export function ModontyCalendarMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="5" y="5.5" width="14" height="13" rx="2" stroke="var(--modonty-calendar-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9.5H19" stroke="var(--modonty-calendar-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 3.5V6.5" stroke="var(--modonty-calendar-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 3.5V6.5" stroke="var(--modonty-calendar-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.15 11.88A0.5 0.5 0 0 1 14.85 11.88L16.62 13.65A0.5 0.5 0 0 1 16.62 14.35L14.85 16.12A0.5 0.5 0 0 1 14.15 16.12L12.38 14.35A0.5 0.5 0 0 1 12.38 13.65Z" fill="var(--modonty-calendar-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="3" y="4" width="10" height="9" rx="1.5" stroke="var(--modonty-calendar-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 6.5H11" stroke="var(--modonty-calendar-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.75 2.5V4" stroke="var(--modonty-calendar-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.25 2.5V4" stroke="var(--modonty-calendar-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.29 8.19A0.3 0.3 0 0 1 9.71 8.19L11.06 9.54A0.3 0.3 0 0 1 11.06 9.96L9.71 11.31A0.3 0.3 0 0 1 9.29 11.31L7.94 9.96A0.3 0.3 0 0 1 7.94 9.54Z" fill="var(--modonty-calendar-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
