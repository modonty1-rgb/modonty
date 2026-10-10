import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty ARROW mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-arrow-body` · `--modonty-arrow-accent` (the diamond).
 */
export function ModontyArrowMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M4 12H13.5" stroke="var(--modonty-arrow-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 6L4 12L10 18" stroke="var(--modonty-arrow-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.65 9.88A0.5 0.5 0 0 1 19.35 9.88L21.12 11.65A0.5 0.5 0 0 1 21.12 12.35L19.35 14.12A0.5 0.5 0 0 1 18.65 14.12L16.88 12.35A0.5 0.5 0 0 1 16.88 11.65Z" fill="var(--modonty-arrow-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2.5 8H8.5" stroke="var(--modonty-arrow-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 4.5L2.5 8L6 11.5" stroke="var(--modonty-arrow-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.04 6.44A0.3 0.3 0 0 1 12.46 6.44L13.81 7.79A0.3 0.3 0 0 1 13.81 8.21L12.46 9.56A0.3 0.3 0 0 1 12.04 9.56L10.69 8.21A0.3 0.3 0 0 1 10.69 7.79Z" fill="var(--modonty-arrow-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
