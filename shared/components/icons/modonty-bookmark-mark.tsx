import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty BOOKMARK mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-bookmark-body` · `--modonty-bookmark-accent` (the diamond).
 */
export function ModontyBookmarkMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M5.5 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2V21L12 17.25L5.5 21Z" stroke="var(--modonty-bookmark-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 7.88A0.5 0.5 0 0 1 12.35 7.88L14.12 9.65A0.5 0.5 0 0 1 14.12 10.35L12.35 12.12A0.5 0.5 0 0 1 11.65 12.12L9.88 10.35A0.5 0.5 0 0 1 9.88 9.65Z" fill="var(--modonty-bookmark-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M3.5 4a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5V14L8 11.4L3.5 14Z" stroke="var(--modonty-bookmark-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 4.94A0.3 0.3 0 0 1 8.21 4.94L9.56 6.29A0.3 0.3 0 0 1 9.56 6.71L8.21 8.06A0.3 0.3 0 0 1 7.79 8.06L6.44 6.71A0.3 0.3 0 0 1 6.44 6.29Z" fill="var(--modonty-bookmark-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
