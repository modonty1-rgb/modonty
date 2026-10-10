import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty EMAIL mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-email-body` · `--modonty-email-accent` (the diamond).
 */
export function ModontyEmailMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="4.5" y="6.5" width="15" height="11" rx="2" stroke="var(--modonty-email-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9.25L12 12.75L19 9.25" stroke="var(--modonty-email-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 10.88A0.5 0.5 0 0 1 12.35 10.88L14.12 12.65A0.5 0.5 0 0 1 14.12 13.35L12.35 15.12A0.5 0.5 0 0 1 11.65 15.12L9.88 13.35A0.5 0.5 0 0 1 9.88 12.65Z" fill="var(--modonty-email-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="2.5" y="3.75" width="11" height="8.5" rx="1.5" stroke="var(--modonty-email-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 5.75L8 8.25L13 5.75" stroke="var(--modonty-email-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.94A0.3 0.3 0 0 1 8.21 6.94L9.56 8.29A0.3 0.3 0 0 1 9.56 8.71L8.21 10.06A0.3 0.3 0 0 1 7.79 10.06L6.44 8.71A0.3 0.3 0 0 1 6.44 8.29Z" fill="var(--modonty-email-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
