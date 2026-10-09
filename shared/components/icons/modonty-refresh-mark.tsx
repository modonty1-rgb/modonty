import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty REFRESH mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-refresh-body` · `--modonty-refresh-accent` (the diamond).
 */
export function ModontyRefreshMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M20 12A8 8 0 1 1 12 4C14.2 4 16.3 4.8 17.8 6.2L20 8" stroke="var(--modonty-refresh-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 3.5V8H15.5" stroke="var(--modonty-refresh-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-refresh-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5C9.6 2.5 11.1 3 12.1 3.9L13.5 5" stroke="var(--modonty-refresh-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 2V5H10.5" stroke="var(--modonty-refresh-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-refresh-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
