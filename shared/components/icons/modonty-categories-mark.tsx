import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty CATEGORIES mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-categories-body` · `--modonty-categories-accent` (the diamond).
 */
export function ModontyCategoriesMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="3.75" y="3.75" width="7" height="7" rx="1.5" stroke="var(--modonty-categories-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16.75" cy="7.25" r="3.5" stroke="var(--modonty-categories-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.75 13.25L20.5 20.25H13Z" stroke="var(--modonty-categories-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.9 14.63A0.5 0.5 0 0 1 7.6 14.63L9.37 16.4A0.5 0.5 0 0 1 9.37 17.1L7.6 18.87A0.5 0.5 0 0 1 6.9 18.87L5.13 17.1A0.5 0.5 0 0 1 5.13 16.4Z" fill="var(--modonty-categories-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="var(--modonty-categories-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11.5" cy="4.5" r="2.5" stroke="var(--modonty-categories-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 9.25L14 13.75H9Z" stroke="var(--modonty-categories-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.29 9.94A0.3 0.3 0 0 1 4.71 9.94L6.06 11.29A0.3 0.3 0 0 1 6.06 11.71L4.71 13.06A0.3 0.3 0 0 1 4.29 13.06L2.94 11.71A0.3 0.3 0 0 1 2.94 11.29Z" fill="var(--modonty-categories-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
