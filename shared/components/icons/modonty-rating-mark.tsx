import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty RATING mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-rating-body` · `--modonty-rating-accent` (the diamond).
 */
export function ModontyRatingMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 3.5L14.79 9.16L21.04 10.06L16.52 14.47L17.58 20.69L12 17.75L6.42 20.69L7.48 14.47L2.96 10.06L9.21 9.16Z" stroke="var(--modonty-rating-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 10.88A0.5 0.5 0 0 1 12.35 10.88L14.12 12.65A0.5 0.5 0 0 1 14.12 13.35L12.35 15.12A0.5 0.5 0 0 1 11.65 15.12L9.88 13.35A0.5 0.5 0 0 1 9.88 12.65Z" fill="var(--modonty-rating-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 2L10.06 5.92L14.42 6.66L11.33 9.83L11.97 14.21L8 12.25L4.03 14.21L4.67 9.83L1.58 6.66L5.94 5.92Z" stroke="var(--modonty-rating-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 7.19A0.3 0.3 0 0 1 8.21 7.19L9.56 8.54A0.3 0.3 0 0 1 9.56 8.96L8.21 10.31A0.3 0.3 0 0 1 7.79 10.31L6.44 8.96A0.3 0.3 0 0 1 6.44 8.54Z" fill="var(--modonty-rating-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
