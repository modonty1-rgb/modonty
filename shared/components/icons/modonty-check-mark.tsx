import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty CHECK mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-check-body` · `--modonty-check-accent` (the diamond).
 */
export function ModontyCheckMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M4 12L10 18L20 8" stroke="var(--modonty-check-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.65 9.63A0.5 0.5 0 0 1 10.35 9.63L12.12 11.4A0.5 0.5 0 0 1 12.12 12.1L10.35 13.87A0.5 0.5 0 0 1 9.65 13.87L7.88 12.1A0.5 0.5 0 0 1 7.88 11.4Z" fill="var(--modonty-check-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M3 8.5L6 11.5L12.5 5" stroke="var(--modonty-check-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.79 5.19A0.3 0.3 0 0 1 6.21 5.19L7.56 6.54A0.3 0.3 0 0 1 7.56 6.96L6.21 8.31A0.3 0.3 0 0 1 5.79 8.31L4.44 6.96A0.3 0.3 0 0 1 4.44 6.54Z" fill="var(--modonty-check-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
