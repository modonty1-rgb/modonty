import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty PLAY mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-play-body` · `--modonty-play-accent` (the diamond).
 */
export function ModontyPlayMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M7 4L20 12L7 20Z" stroke="var(--modonty-play-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.15 9.88A0.5 0.5 0 0 1 11.85 9.88L13.62 11.65A0.5 0.5 0 0 1 13.62 12.35L11.85 14.12A0.5 0.5 0 0 1 11.15 14.12L9.38 12.35A0.5 0.5 0 0 1 9.38 11.65Z" fill="var(--modonty-play-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M4 2L13 8L4 14Z" stroke="var(--modonty-play-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.99 6.44A0.3 0.3 0 0 1 7.41 6.44L8.76 7.79A0.3 0.3 0 0 1 8.76 8.21L7.41 9.56A0.3 0.3 0 0 1 6.99 9.56L5.64 8.21A0.3 0.3 0 0 1 5.64 7.79Z" fill="var(--modonty-play-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
