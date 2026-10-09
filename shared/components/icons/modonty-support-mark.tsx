import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty SUPPORT mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-support-body` · `--modonty-support-accent` (the diamond).
 */
export function ModontySupportMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M5.25 12.5V11.25a6.75 6.75 0 0 1 13.5 0V12.5" stroke="var(--modonty-support-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3.5" y="12.5" width="3.5" height="5.5" rx="1.5" stroke="var(--modonty-support-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="17" y="12.5" width="3.5" height="5.5" rx="1.5" stroke="var(--modonty-support-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.75 18A2.25 2.25 0 0 1 16.5 20.25H15.5" stroke="var(--modonty-support-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.75 18.13A0.5 0.5 0 0 1 11.45 18.13L13.22 19.9A0.5 0.5 0 0 1 13.22 20.6L11.45 22.37A0.5 0.5 0 0 1 10.75 22.37L8.98 20.6A0.5 0.5 0 0 1 8.98 19.9Z" fill="var(--modonty-support-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M3.25 8V7.5a4.75 4.75 0 0 1 9.5 0V8" stroke="var(--modonty-support-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2" y="8" width="2.5" height="3.5" rx="1" stroke="var(--modonty-support-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="11.5" y="8" width="2.5" height="3.5" rx="1" stroke="var(--modonty-support-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.75 11.5A1.75 1.75 0 0 1 11 13.25H10.5" stroke="var(--modonty-support-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.89 11.54A0.3 0.3 0 0 1 7.31 11.54L8.66 12.89A0.3 0.3 0 0 1 8.66 13.31L7.31 14.66A0.3 0.3 0 0 1 6.89 14.66L5.54 13.31A0.3 0.3 0 0 1 5.54 12.89Z" fill="var(--modonty-support-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
