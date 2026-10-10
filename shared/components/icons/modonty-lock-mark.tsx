import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty LOCK mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-lock-body` · `--modonty-lock-accent` (the diamond).
 */
export function ModontyLockMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="5" y="10.5" width="14" height="10.5" rx="2" stroke="var(--modonty-lock-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0V10.5" stroke="var(--modonty-lock-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 13.63A0.5 0.5 0 0 1 12.35 13.63L14.12 15.4A0.5 0.5 0 0 1 14.12 16.1L12.35 17.87A0.5 0.5 0 0 1 11.65 17.87L9.88 16.1A0.5 0.5 0 0 1 9.88 15.4Z" fill="var(--modonty-lock-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="var(--modonty-lock-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 7V5.25a2.75 2.75 0 0 1 5.5 0V7" stroke="var(--modonty-lock-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 8.94A0.3 0.3 0 0 1 8.21 8.94L9.56 10.29A0.3 0.3 0 0 1 9.56 10.71L8.21 12.06A0.3 0.3 0 0 1 7.79 12.06L6.44 10.71A0.3 0.3 0 0 1 6.44 10.29Z" fill="var(--modonty-lock-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
