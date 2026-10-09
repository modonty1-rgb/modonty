import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty PARTNER FILLED mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-partner-body` · `--modonty-partner-accent` (the diamond) · `--modonty-knockout` (the ring around the diamond; defaults to the page background).
 */
export function ModontyPartnerFilledMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="8.5" cy="12" r="5.5" stroke="var(--modonty-partner-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="15.5" cy="12" r="5.5" stroke="var(--modonty-partner-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7.757A5.5 5.5 0 0 1 12 16.243A5.5 5.5 0 0 1 12 7.757Z" fill="var(--modonty-partner-body, currentColor)" stroke="var(--modonty-partner-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-knockout, hsl(var(--background)))" stroke="var(--modonty-knockout, hsl(var(--background)))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-partner-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="5.25" cy="8" r="3.6" stroke="var(--modonty-partner-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10.75" cy="8" r="3.6" stroke="var(--modonty-partner-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 5.677A3.6 3.6 0 0 1 8 10.323A3.6 3.6 0 0 1 8 5.677Z" fill="var(--modonty-partner-body, currentColor)" stroke="var(--modonty-partner-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-knockout, hsl(var(--background)))" stroke="var(--modonty-knockout, hsl(var(--background)))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-partner-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
