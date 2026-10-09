import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty CHEVRON RIGHT mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Derived from the `chevron` mark by baking the rotation into the path data.
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-chevron-right-body` · `--modonty-chevron-right-accent` (the diamond).
 */
export function ModontyChevronRightMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M11 4L19 12 11 20" stroke="var(--modonty-chevron-right-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.35 9.88A0.5 0.5 0 0 0 5.65 9.88L3.88 11.65A0.5 0.5 0 0 0 3.88 12.35L5.65 14.12A0.5 0.5 0 0 0 6.35 14.12L8.12 12.35A0.5 0.5 0 0 0 8.12 11.65Z" fill="var(--modonty-chevron-right-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M7.5 3L12.5 8 7.5 13" stroke="var(--modonty-chevron-right-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.46 6.44A0.3 0.3 0 0 0 4.04 6.44L2.69 7.79A0.3 0.3 0 0 0 2.69 8.21L4.04 9.56A0.3 0.3 0 0 0 4.46 9.56L5.81 8.21A0.3 0.3 0 0 0 5.81 7.79Z" fill="var(--modonty-chevron-right-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
