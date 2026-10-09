import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty HOME mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-home-body` · `--modonty-home-accent` (the diamond).
 */
export function ModontyHomeMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3.5 11.75L12 3.25L20.5 11.75" stroke="var(--modonty-home-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 10V18.5a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V10" stroke="var(--modonty-home-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 12.88A0.5 0.5 0 0 1 12.35 12.88L14.12 14.65A0.5 0.5 0 0 1 14.12 15.35L12.35 17.12A0.5 0.5 0 0 1 11.65 17.12L9.88 15.35A0.5 0.5 0 0 1 9.88 14.65Z" fill="var(--modonty-home-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2.5 7.5L8 2L13.5 7.5" stroke="var(--modonty-home-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 6.5V12a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V6.5" stroke="var(--modonty-home-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 8.19A0.3 0.3 0 0 1 8.21 8.19L9.56 9.54A0.3 0.3 0 0 1 9.56 9.96L8.21 11.31A0.3 0.3 0 0 1 7.79 11.31L6.44 9.96A0.3 0.3 0 0 1 6.44 9.54Z" fill="var(--modonty-home-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
