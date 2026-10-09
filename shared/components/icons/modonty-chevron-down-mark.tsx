import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty CHEVRON DOWN mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Derived from the `chevron` mark by baking the rotation into the path data.
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-chevron-down-body` · `--modonty-chevron-down-accent` (the diamond).
 */
export function ModontyChevronDownMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M4 11L12 19 20 11" stroke="var(--modonty-chevron-down-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.88 6.35A0.5 0.5 0 0 1 9.88 5.65L11.65 3.88A0.5 0.5 0 0 1 12.35 3.88L14.12 5.65A0.5 0.5 0 0 1 14.12 6.35L12.35 8.12A0.5 0.5 0 0 1 11.65 8.12Z" fill="var(--modonty-chevron-down-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M3 7.5L8 12.5 13 7.5" stroke="var(--modonty-chevron-down-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.44 4.46A0.3 0.3 0 0 1 6.44 4.04L7.79 2.69A0.3 0.3 0 0 1 8.21 2.69L9.56 4.04A0.3 0.3 0 0 1 9.56 4.46L8.21 5.81A0.3 0.3 0 0 1 7.79 5.81Z" fill="var(--modonty-chevron-down-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
