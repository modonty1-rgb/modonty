import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty FILTER mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-filter-body` · `--modonty-filter-accent` (the diamond).
 */
export function ModontyFilterMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3.5 4.5H20.5L14.5 12.5V19.5L9.5 21V12.5Z" stroke="var(--modonty-filter-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 6.78A0.5 0.5 0 0 1 12.35 6.78L14.12 8.55A0.5 0.5 0 0 1 14.12 9.25L12.35 11.02A0.5 0.5 0 0 1 11.65 11.02L9.88 9.25A0.5 0.5 0 0 1 9.88 8.55Z" fill="var(--modonty-filter-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2 2.5H14L10.5 8.5V12.5L5.5 13.5V8.5Z" stroke="var(--modonty-filter-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 4.59A0.3 0.3 0 0 1 8.21 4.59L9.56 5.94A0.3 0.3 0 0 1 9.56 6.36L8.21 7.71A0.3 0.3 0 0 1 7.79 7.71L6.44 6.36A0.3 0.3 0 0 1 6.44 5.94Z" fill="var(--modonty-filter-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
