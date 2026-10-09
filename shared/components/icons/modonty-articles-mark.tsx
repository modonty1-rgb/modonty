import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty ARTICLES mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-articles-body` · `--modonty-articles-accent` (the diamond).
 */
export function ModontyArticlesMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="6" y="4" width="12" height="16.5" rx="2" stroke="var(--modonty-articles-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.25 13H9.75" stroke="var(--modonty-articles-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.25 16.75H11.75" stroke="var(--modonty-articles-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.3 6.28A0.5 0.5 0 0 1 13 6.28L14.77 8.05A0.5 0.5 0 0 1 14.77 8.75L13 10.52A0.5 0.5 0 0 1 12.3 10.52L10.53 8.75A0.5 0.5 0 0 1 10.53 8.05Z" fill="var(--modonty-articles-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="3.5" y="2.5" width="9" height="11" rx="1.5" stroke="var(--modonty-articles-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 10.5H6.5" stroke="var(--modonty-articles-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 4.69A0.3 0.3 0 0 1 8.21 4.69L9.56 6.04A0.3 0.3 0 0 1 9.56 6.46L8.21 7.81A0.3 0.3 0 0 1 7.79 7.81L6.44 6.46A0.3 0.3 0 0 1 6.44 6.04Z" fill="var(--modonty-articles-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
