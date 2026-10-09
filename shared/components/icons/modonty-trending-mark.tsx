import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty TRENDING mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-trending-body` · `--modonty-trending-accent` (the diamond).
 */
export function ModontyTrendingMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M19 17.5L13.5 12L10.5 15L3.5 8" stroke="var(--modonty-trending-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 8H3.5V14" stroke="var(--modonty-trending-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.65 15.38A0.5 0.5 0 0 1 19.35 15.38L21.12 17.15A0.5 0.5 0 0 1 21.12 17.85L19.35 19.62A0.5 0.5 0 0 1 18.65 19.62L16.88 17.85A0.5 0.5 0 0 1 16.88 17.15Z" fill="var(--modonty-trending-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M12.5 11.5L9.5 8.5L7 11L2.5 6.5" stroke="var(--modonty-trending-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 6.5H2.5V10.5" stroke="var(--modonty-trending-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.29 9.94A0.3 0.3 0 0 1 12.71 9.94L14.06 11.29A0.3 0.3 0 0 1 14.06 11.71L12.71 13.06A0.3 0.3 0 0 1 12.29 13.06L10.94 11.71A0.3 0.3 0 0 1 10.94 11.29Z" fill="var(--modonty-trending-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
