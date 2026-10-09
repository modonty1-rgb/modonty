import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty REELS mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-reels-body` · `--modonty-reels-accent` (the diamond).
 */
export function ModontyReelsMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M5 11.5H19V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" stroke="var(--modonty-reels-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 11.5L18.52 7.88L17.94 5.7L4.42 9.33Z" stroke="var(--modonty-reels-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 13.63A0.5 0.5 0 0 1 12.35 13.63L14.12 15.4A0.5 0.5 0 0 1 14.12 16.1L12.35 17.87A0.5 0.5 0 0 1 11.65 17.87L9.88 16.1A0.5 0.5 0 0 1 9.88 15.4Z" fill="var(--modonty-reels-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M3.5 6H12.5V12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 12Z" stroke="var(--modonty-reels-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 6L12.19 3.67" stroke="var(--modonty-reels-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 8.19A0.3 0.3 0 0 1 8.21 8.19L9.56 9.54A0.3 0.3 0 0 1 9.56 9.96L8.21 11.31A0.3 0.3 0 0 1 7.79 11.31L6.44 9.96A0.3 0.3 0 0 1 6.44 9.54Z" fill="var(--modonty-reels-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
