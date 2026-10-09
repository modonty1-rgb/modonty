import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty ERROR mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-error-body` · `--modonty-error-accent` (the diamond).
 */
export function ModontyErrorMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M8.27 3H15.73L21 8.27V15.73L15.73 21H8.27L3 15.73V8.27Z" stroke="var(--modonty-error-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7.25V12" stroke="var(--modonty-error-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 14.28A0.5 0.5 0 0 1 12.35 14.28L14.12 16.05A0.5 0.5 0 0 1 14.12 16.75L12.35 18.52A0.5 0.5 0 0 1 11.65 18.52L9.88 16.75A0.5 0.5 0 0 1 9.88 16.05Z" fill="var(--modonty-error-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M4.34 1.75H11.66L14.25 4.34V11.66L11.66 14.25H4.34L1.75 11.66V4.34Z" stroke="var(--modonty-error-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 4.5V7.25" stroke="var(--modonty-error-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 9.04A0.3 0.3 0 0 1 8.21 9.04L9.56 10.39A0.3 0.3 0 0 1 9.56 10.81L8.21 12.16A0.3 0.3 0 0 1 7.79 12.16L6.44 10.81A0.3 0.3 0 0 1 6.44 10.39Z" fill="var(--modonty-error-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
