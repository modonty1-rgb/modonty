import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty EXTERNAL mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-external-body` · `--modonty-external-accent` (the diamond).
 */
export function ModontyExternalMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 4H18a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V14" stroke="var(--modonty-external-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 8V4H8" stroke="var(--modonty-external-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 4L11.5 11.5" stroke="var(--modonty-external-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.65 12.88A0.5 0.5 0 0 1 15.35 12.88L17.12 14.65A0.5 0.5 0 0 1 17.12 15.35L15.35 17.12A0.5 0.5 0 0 1 14.65 17.12L12.88 15.35A0.5 0.5 0 0 1 12.88 14.65Z" fill="var(--modonty-external-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M9 2.5H12A1.5 1.5 0 0 1 13.5 4V12A1.5 1.5 0 0 1 12 13.5H4.5A1.5 1.5 0 0 1 3 12V9" stroke="var(--modonty-external-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 5.5V2.5H6" stroke="var(--modonty-external-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 2.5L7 6.5" stroke="var(--modonty-external-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.29 7.94A0.3 0.3 0 0 1 9.71 7.94L11.06 9.29A0.3 0.3 0 0 1 11.06 9.71L9.71 11.06A0.3 0.3 0 0 1 9.29 11.06L7.94 9.71A0.3 0.3 0 0 1 7.94 9.29Z" fill="var(--modonty-external-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
