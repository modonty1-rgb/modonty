import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty LOGIN mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-login-body` · `--modonty-login-accent` (the diamond).
 */
export function ModontyLoginMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M10 3.5H6a2 2 0 0 0-2 2V18.5a2 2 0 0 0 2 2h4" stroke="var(--modonty-login-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 12H14.5" stroke="var(--modonty-login-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 7.5L9.5 12L14 16.5" stroke="var(--modonty-login-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.15 9.88A0.5 0.5 0 0 1 19.85 9.88L21.62 11.65A0.5 0.5 0 0 1 21.62 12.35L19.85 14.12A0.5 0.5 0 0 1 19.15 14.12L17.38 12.35A0.5 0.5 0 0 1 17.38 11.65Z" fill="var(--modonty-login-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M6.5 2.5H4.5A1.5 1.5 0 0 0 3 4V12A1.5 1.5 0 0 0 4.5 13.5H6.5" stroke="var(--modonty-login-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 8H8.5" stroke="var(--modonty-login-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 5L6.5 8L9.5 11" stroke="var(--modonty-login-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.29 6.44A0.3 0.3 0 0 1 12.71 6.44L14.06 7.79A0.3 0.3 0 0 1 14.06 8.21L12.71 9.56A0.3 0.3 0 0 1 12.29 9.56L10.94 8.21A0.3 0.3 0 0 1 10.94 7.79Z" fill="var(--modonty-login-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
