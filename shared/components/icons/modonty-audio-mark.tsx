import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty AUDIO mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-audio-body` · `--modonty-audio-accent` (the diamond).
 */
export function ModontyAudioMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M13 4.5L17 9H20a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H17L13 19.5Z" stroke="var(--modonty-audio-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 9V15" stroke="var(--modonty-audio-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.25 8.5A8.54 8.54 0 0 0 9.25 15.5" stroke="var(--modonty-audio-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.3 9.88A0.5 0.5 0 0 1 4 9.88L5.77 11.65A0.5 0.5 0 0 1 5.77 12.35L4 14.12A0.5 0.5 0 0 1 3.3 14.12L1.53 12.35A0.5 0.5 0 0 1 1.53 11.65Z" fill="var(--modonty-audio-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M10 2.5L12.5 5.25H13.75a.5.5 0 0 1 .5.5V10.25a.5.5 0 0 1-.5.5H12.5L10 13.5Z" stroke="var(--modonty-audio-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.25 5.5A4.54 4.54 0 0 0 7.25 10.5" stroke="var(--modonty-audio-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.79 6.44A0.3 0.3 0 0 1 3.21 6.44L4.56 7.79A0.3 0.3 0 0 1 4.56 8.21L3.21 9.56A0.3 0.3 0 0 1 2.79 9.56L1.44 8.21A0.3 0.3 0 0 1 1.44 7.79Z" fill="var(--modonty-audio-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
