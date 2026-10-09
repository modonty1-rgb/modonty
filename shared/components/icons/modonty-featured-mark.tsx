import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty FEATURED mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-featured-body` · `--modonty-featured-accent` (the diamond).
 */
export function ModontyFeaturedMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="12" cy="9.5" r="6.5" stroke="var(--modonty-featured-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 14.5L7.5 21L12 18.75L16.5 21L15.5 14.5" stroke="var(--modonty-featured-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 7.38A0.5 0.5 0 0 1 12.35 7.38L14.12 9.15A0.5 0.5 0 0 1 14.12 9.85L12.35 11.62A0.5 0.5 0 0 1 11.65 11.62L9.88 9.85A0.5 0.5 0 0 1 9.88 9.15Z" fill="var(--modonty-featured-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="8" cy="6.5" r="4.5" stroke="var(--modonty-featured-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.7 10.2L5 14L8 12.4L11 14L10.3 10.2" stroke="var(--modonty-featured-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 4.94A0.3 0.3 0 0 1 8.21 4.94L9.56 6.29A0.3 0.3 0 0 1 9.56 6.71L8.21 8.06A0.3 0.3 0 0 1 7.79 8.06L6.44 6.71A0.3 0.3 0 0 1 6.44 6.29Z" fill="var(--modonty-featured-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
