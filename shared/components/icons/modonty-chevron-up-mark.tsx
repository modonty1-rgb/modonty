import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty CHEVRON UP mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Derived from the `chevron` mark by baking the rotation into the path data.
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-chevron-up-body` · `--modonty-chevron-up-accent` (the diamond).
 */
export function ModontyChevronUpMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M20 13L12 5 4 13" stroke="var(--modonty-chevron-up-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.12 17.65A0.5 0.5 0 0 1 14.12 18.35L12.35 20.12A0.5 0.5 0 0 1 11.65 20.12L9.88 18.35A0.5 0.5 0 0 1 9.88 17.65L11.65 15.88A0.5 0.5 0 0 1 12.35 15.88Z" fill="var(--modonty-chevron-up-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M13 8.5L8 3.5 3 8.5" stroke="var(--modonty-chevron-up-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.56 11.54A0.3 0.3 0 0 1 9.56 11.96L8.21 13.31A0.3 0.3 0 0 1 7.79 13.31L6.44 11.96A0.3 0.3 0 0 1 6.44 11.54L7.79 10.19A0.3 0.3 0 0 1 8.21 10.19Z" fill="var(--modonty-chevron-up-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
