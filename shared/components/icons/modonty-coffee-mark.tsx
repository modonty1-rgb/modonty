import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty COFFEE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-coffee-body` · `--modonty-coffee-accent` (the diamond).
 */
export function ModontyCoffeeMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M4.25 9.5H15.75V15a5 5 0 0 1-5 5H9.25a5 5 0 0 1-5-5Z" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.75 10.75H17.25a2.75 2.75 0 0 1 0 5.5H15.5" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 3.75V6.25" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3.75V6.25" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.65 12.13A0.5 0.5 0 0 1 10.35 12.13L12.12 13.9A0.5 0.5 0 0 1 12.12 14.6L10.35 16.37A0.5 0.5 0 0 1 9.65 16.37L7.88 14.6A0.5 0.5 0 0 1 7.88 13.9Z" fill="var(--modonty-coffee-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2.75 6H10.25V9.75a3.5 3.5 0 0 1-3.5 3.5H6.25a3.5 3.5 0 0 1-3.5-3.5Z" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.25 7.25H11.25a1.75 1.75 0 0 1 0 3.5H10" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 2.5V4" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 2.5V4" stroke="var(--modonty-coffee-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.29 7.94A0.3 0.3 0 0 1 6.71 7.94L8.06 9.29A0.3 0.3 0 0 1 8.06 9.71L6.71 11.06A0.3 0.3 0 0 1 6.29 11.06L4.94 9.71A0.3 0.3 0 0 1 4.94 9.29Z" fill="var(--modonty-coffee-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
