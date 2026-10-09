import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty ARROW UP mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Derived from the `arrow` mark by baking the rotation into the path data.
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-arrow-up-body` · `--modonty-arrow-up-accent` (the diamond).
 */
export function ModontyArrowUpMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 4L12 13.5" stroke="var(--modonty-arrow-up-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 10L12 4 6 10" stroke="var(--modonty-arrow-up-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.12 18.65A0.5 0.5 0 0 1 14.12 19.35L12.35 21.12A0.5 0.5 0 0 1 11.65 21.12L9.88 19.35A0.5 0.5 0 0 1 9.88 18.65L11.65 16.88A0.5 0.5 0 0 1 12.35 16.88Z" fill="var(--modonty-arrow-up-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 2.5L8 8.5" stroke="var(--modonty-arrow-up-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 6L8 2.5 4.5 6" stroke="var(--modonty-arrow-up-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.56 12.04A0.3 0.3 0 0 1 9.56 12.46L8.21 13.81A0.3 0.3 0 0 1 7.79 13.81L6.44 12.46A0.3 0.3 0 0 1 6.44 12.04L7.79 10.69A0.3 0.3 0 0 1 8.21 10.69Z" fill="var(--modonty-arrow-up-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
