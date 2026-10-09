import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty SORT mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-sort-body` · `--modonty-sort-accent` (the diamond).
 */
export function ModontySortMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M7 19.5V4.5" stroke="var(--modonty-sort-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 8L7 4.5L10.5 8" stroke="var(--modonty-sort-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 4.5V19.5" stroke="var(--modonty-sort-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 16L17 19.5L20.5 16" stroke="var(--modonty-sort-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-sort-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M4.5 13.5V2.5" stroke="var(--modonty-sort-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 4.5L4.5 2.5L6.5 4.5" stroke="var(--modonty-sort-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 2.5V13.5" stroke="var(--modonty-sort-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 11.5L11.5 13.5L13.5 11.5" stroke="var(--modonty-sort-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-sort-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
