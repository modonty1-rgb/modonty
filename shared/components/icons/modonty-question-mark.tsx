import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty QUESTION mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-question-body` · `--modonty-question-accent` (the diamond).
 */
export function ModontyQuestionMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="12" cy="12" r="9" stroke="var(--modonty-question-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.75 8.75A2.25 2.25 0 0 1 14.25 8.75C14.25 10.5 12 10.6 12 12.25" stroke="var(--modonty-question-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 14.38A0.5 0.5 0 0 1 12.35 14.38L14.12 16.15A0.5 0.5 0 0 1 14.12 16.85L12.35 18.62A0.5 0.5 0 0 1 11.65 18.62L9.88 16.85A0.5 0.5 0 0 1 9.88 16.15Z" fill="var(--modonty-question-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="8" cy="8" r="6.25" stroke="var(--modonty-question-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 5.5A1.5 1.5 0 0 1 9.5 5.5C9.5 6.7 8 6.8 8 7.7" stroke="var(--modonty-question-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 9.44A0.3 0.3 0 0 1 8.21 9.44L9.56 10.79A0.3 0.3 0 0 1 9.56 11.21L8.21 12.56A0.3 0.3 0 0 1 7.79 12.56L6.44 11.21A0.3 0.3 0 0 1 6.44 10.79Z" fill="var(--modonty-question-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
