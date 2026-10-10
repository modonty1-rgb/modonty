import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty TAGS mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-tags-body` · `--modonty-tags-accent` (the diamond).
 */
export function ModontyTagsMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M10 5.5H18a2.5 2.5 0 0 1 2.5 2.5V16A2.5 2.5 0 0 1 18 18.5H10L3.5 12Z" stroke="var(--modonty-tags-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.15 9.88A0.5 0.5 0 0 1 15.85 9.88L17.62 11.65A0.5 0.5 0 0 1 17.62 12.35L15.85 14.12A0.5 0.5 0 0 1 15.15 14.12L13.38 12.35A0.5 0.5 0 0 1 13.38 11.65Z" fill="var(--modonty-tags-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M6 4H12A1.5 1.5 0 0 1 13.5 5.5V10.5A1.5 1.5 0 0 1 12 12H6L2 8Z" stroke="var(--modonty-tags-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.69 6.44A0.3 0.3 0 0 1 10.11 6.44L11.46 7.79A0.3 0.3 0 0 1 11.46 8.21L10.11 9.56A0.3 0.3 0 0 1 9.69 9.56L8.34 8.21A0.3 0.3 0 0 1 8.34 7.79Z" fill="var(--modonty-tags-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
