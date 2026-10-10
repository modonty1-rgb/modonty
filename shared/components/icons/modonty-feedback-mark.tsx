import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty FEEDBACK mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-feedback-body` · `--modonty-feedback-accent` (the diamond).
 */
export function ModontyFeedbackMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M19 20L15 16H7A2 2 0 0 1 5 14V6A2 2 0 0 1 7 4H17A2 2 0 0 1 19 6Z" stroke="var(--modonty-feedback-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6.8L13 8.62L15.04 9.01L13.62 10.53L14.26 12.59L12 11.7L9.74 12.59L10.38 10.53L8.96 9.01L11 8.62Z" stroke="var(--modonty-feedback-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 7.88A0.5 0.5 0 0 1 12.35 7.88L14.12 9.65A0.5 0.5 0 0 1 14.12 10.35L12.35 12.12A0.5 0.5 0 0 1 11.65 12.12L9.88 10.35A0.5 0.5 0 0 1 9.88 9.65Z" fill="var(--modonty-feedback-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M13.5 14L11.5 12H4A1.5 1.5 0 0 1 2.5 10.5V4A1.5 1.5 0 0 1 4 2.5H12A1.5 1.5 0 0 1 13.5 4Z" stroke="var(--modonty-feedback-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 5.69A0.3 0.3 0 0 1 8.21 5.69L9.56 7.04A0.3 0.3 0 0 1 9.56 7.46L8.21 8.81A0.3 0.3 0 0 1 7.79 8.81L6.44 7.46A0.3 0.3 0 0 1 6.44 7.04Z" fill="var(--modonty-feedback-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
