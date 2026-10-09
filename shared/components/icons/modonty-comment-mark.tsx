import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty COMMENT mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-comment-body` · `--modonty-comment-accent` (the diamond).
 */
export function ModontyCommentMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M7.5 3H16.5A2.5 2.5 0 0 1 19 5.5V21L15.5 17.5H7.5A2.5 2.5 0 0 1 5 15V5.5A2.5 2.5 0 0 1 7.5 3Z" stroke="var(--modonty-comment-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.5 7.5H9.5" stroke="var(--modonty-comment-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.5 12.25H14.25" stroke="var(--modonty-comment-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.4 10.13A0.5 0.5 0 0 1 10.1 10.13L11.87 11.9A0.5 0.5 0 0 1 11.87 12.6L10.1 14.37A0.5 0.5 0 0 1 9.4 14.37L7.63 12.6A0.5 0.5 0 0 1 7.63 11.9Z" fill="var(--modonty-comment-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M4.5 2H11.5A1.5 1.5 0 0 1 13 3.5V14L11.5 11.75H4.5A1.5 1.5 0 0 1 3 10.25V3.5A1.5 1.5 0 0 1 4.5 2Z" stroke="var(--modonty-comment-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 4.75H5.5" stroke="var(--modonty-comment-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.29 6.94A0.3 0.3 0 0 1 9.71 6.94L11.06 8.29A0.3 0.3 0 0 1 11.06 8.71L9.71 10.06A0.3 0.3 0 0 1 9.29 10.06L7.94 8.71A0.3 0.3 0 0 1 7.94 8.29Z" fill="var(--modonty-comment-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
