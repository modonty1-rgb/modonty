import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty ARROW RIGHT mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Derived from the `arrow` mark by baking the rotation into the path data.
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-arrow-right-body` · `--modonty-arrow-right-accent` (the diamond).
 */
export function ModontyArrowRightMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M20 12H10.5" stroke="var(--modonty-arrow-right-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 6L20 12 14 18" stroke="var(--modonty-arrow-right-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.35 9.88A0.5 0.5 0 0 0 4.65 9.88L2.88 11.65A0.5 0.5 0 0 0 2.88 12.35L4.65 14.12A0.5 0.5 0 0 0 5.35 14.12L7.12 12.35A0.5 0.5 0 0 0 7.12 11.65Z" fill="var(--modonty-arrow-right-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M13.5 8H7.5" stroke="var(--modonty-arrow-right-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 4.5L13.5 8 10 11.5" stroke="var(--modonty-arrow-right-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.96 6.44A0.3 0.3 0 0 0 3.54 6.44L2.19 7.79A0.3 0.3 0 0 0 2.19 8.21L3.54 9.56A0.3 0.3 0 0 0 3.96 9.56L5.31 8.21A0.3 0.3 0 0 0 5.31 7.79Z" fill="var(--modonty-arrow-right-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
