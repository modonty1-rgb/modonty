import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty LOGOUT mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-logout-body` · `--modonty-logout-accent` (the diamond).
 */
export function ModontyLogoutMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M13 3.5H19a2 2 0 0 1 2 2V18.5a2 2 0 0 1-2 2H13" stroke="var(--modonty-logout-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 12H11.5" stroke="var(--modonty-logout-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 7.5L4 12L8.5 16.5" stroke="var(--modonty-logout-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.15 9.88A0.5 0.5 0 0 1 16.85 9.88L18.62 11.65A0.5 0.5 0 0 1 18.62 12.35L16.85 14.12A0.5 0.5 0 0 1 16.15 14.12L14.38 12.35A0.5 0.5 0 0 1 14.38 11.65Z" fill="var(--modonty-logout-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8.5 2.5H12A1.5 1.5 0 0 1 13.5 4V12A1.5 1.5 0 0 1 12 13.5H8.5" stroke="var(--modonty-logout-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 8H6" stroke="var(--modonty-logout-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 5L2.5 8L5.5 11" stroke="var(--modonty-logout-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.54 6.44A0.3 0.3 0 0 1 9.96 6.44L11.31 7.79A0.3 0.3 0 0 1 11.31 8.21L9.96 9.56A0.3 0.3 0 0 1 9.54 9.56L8.19 8.21A0.3 0.3 0 0 1 8.19 7.79Z" fill="var(--modonty-logout-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
