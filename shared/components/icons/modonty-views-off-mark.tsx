import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty VIEWS OFF mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-views-off-body` · `--modonty-views-off-accent` (the diamond).
 */
export function ModontyViewsOffMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3 12C5.2 8 8.3 6 12 6s6.8 2 9 6c-2.2 4-5.3 6-9 6s-6.8-2-9-6Z" stroke="var(--modonty-views-off-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 6.5L17.5 17.5" stroke="var(--modonty-views-off-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-views-off-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2 8C3.6 5.4 5.6 4 8 4s4.4 1.4 6 4c-1.6 2.6-3.6 4-6 4s-4.4-1.4-6-4Z" stroke="var(--modonty-views-off-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 3.5L12.5 12.5" stroke="var(--modonty-views-off-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-views-off-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
