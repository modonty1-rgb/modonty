import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty ADVANCE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-advance-body` · `--modonty-advance-accent` (the diamond).
 */
export function ModontyAdvanceMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M20 12.5A8.5 8.5 0 1 1 17.5 6.5" stroke="var(--modonty-advance-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.5 3.5V6.5H14" stroke="var(--modonty-advance-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 12.5H13" stroke="var(--modonty-advance-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.5 11V14" stroke="var(--modonty-advance-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.65 10.38A0.5 0.5 0 0 1 20.35 10.38L22.12 12.15A0.5 0.5 0 0 1 22.12 12.85L20.35 14.62A0.5 0.5 0 0 1 19.65 14.62L17.88 12.85A0.5 0.5 0 0 1 17.88 12.15Z" fill="var(--modonty-advance-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M13 8.5A5.5 5.5 0 1 1 11.4 4.6" stroke="var(--modonty-advance-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.4 2.2V4.6H9" stroke="var(--modonty-advance-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 8.5H8.5" stroke="var(--modonty-advance-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 7.5V9.5" stroke="var(--modonty-advance-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.79 6.94A0.3 0.3 0 0 1 13.21 6.94L14.56 8.29A0.3 0.3 0 0 1 14.56 8.71L13.21 10.06A0.3 0.3 0 0 1 12.79 10.06L11.44 8.71A0.3 0.3 0 0 1 11.44 8.29Z" fill="var(--modonty-advance-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
