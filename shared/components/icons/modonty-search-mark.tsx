import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty SEARCH mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-search-body` · `--modonty-search-accent` (the diamond).
 */
export function ModontySearchMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="10.5" cy="10.5" r="6.5" stroke="var(--modonty-search-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.1 15.1L20.5 20.5" stroke="var(--modonty-search-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.15 8.38A0.5 0.5 0 0 1 10.85 8.38L12.62 10.15A0.5 0.5 0 0 1 12.62 10.85L10.85 12.62A0.5 0.5 0 0 1 10.15 12.62L8.38 10.85A0.5 0.5 0 0 1 8.38 10.15Z" fill="var(--modonty-search-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="7" cy="7" r="4.5" stroke="var(--modonty-search-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.18 10.18L14 14" stroke="var(--modonty-search-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.79 5.44A0.3 0.3 0 0 1 7.21 5.44L8.56 6.79A0.3 0.3 0 0 1 8.56 7.21L7.21 8.56A0.3 0.3 0 0 1 6.79 8.56L5.44 7.21A0.3 0.3 0 0 1 5.44 6.79Z" fill="var(--modonty-search-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
