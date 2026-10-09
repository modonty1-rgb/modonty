import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty CHEVRON mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-chevron-body` · `--modonty-chevron-accent` (the diamond).
 */
export function ModontyChevronMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M13 4L5 12L13 20" stroke="var(--modonty-chevron-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.65 9.88A0.5 0.5 0 0 1 18.35 9.88L20.12 11.65A0.5 0.5 0 0 1 20.12 12.35L18.35 14.12A0.5 0.5 0 0 1 17.65 14.12L15.88 12.35A0.5 0.5 0 0 1 15.88 11.65Z" fill="var(--modonty-chevron-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8.5 3L3.5 8L8.5 13" stroke="var(--modonty-chevron-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.54 6.44A0.3 0.3 0 0 1 11.96 6.44L13.31 7.79A0.3 0.3 0 0 1 13.31 8.21L11.96 9.56A0.3 0.3 0 0 1 11.54 9.56L10.19 8.21A0.3 0.3 0 0 1 10.19 7.79Z" fill="var(--modonty-chevron-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
