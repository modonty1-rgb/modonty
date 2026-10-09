import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty INDUSTRIES mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-industries-body` · `--modonty-industries-accent` (the diamond).
 */
export function ModontyIndustriesMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="4" y="4" width="6.5" height="6.5" rx="2" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.9 14.63A0.5 0.5 0 0 1 7.6 14.63L9.37 16.4A0.5 0.5 0 0 1 9.37 17.1L7.6 18.87A0.5 0.5 0 0 1 6.9 18.87L5.13 17.1A0.5 0.5 0 0 1 5.13 16.4Z" fill="var(--modonty-industries-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="2.5" y="2.5" width="4" height="4" rx="1.25" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9.5" y="2.5" width="4" height="4" rx="1.25" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9.5" y="9.5" width="4" height="4" rx="1.25" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.29 9.94A0.3 0.3 0 0 1 4.71 9.94L6.06 11.29A0.3 0.3 0 0 1 6.06 11.71L4.71 13.06A0.3 0.3 0 0 1 4.29 13.06L2.94 11.71A0.3 0.3 0 0 1 2.94 11.29Z" fill="var(--modonty-industries-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
