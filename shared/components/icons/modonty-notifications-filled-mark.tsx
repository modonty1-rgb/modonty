import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty NOTIFICATIONS FILLED mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-notifications-body` · `--modonty-notifications-accent` (the diamond) · `--modonty-knockout` (the ring around the diamond; defaults to the page background).
 */
export function ModontyNotificationsFilledMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M6.5 14V8.5a5.5 5.5 0 0 1 11 0V14l1.75 2H4.75Z" fill="var(--modonty-notifications-body, currentColor)" stroke="var(--modonty-notifications-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 18.38A0.5 0.5 0 0 1 12.35 18.38L14.12 20.15A0.5 0.5 0 0 1 14.12 20.85L12.35 22.62A0.5 0.5 0 0 1 11.65 22.62L9.88 20.85A0.5 0.5 0 0 1 9.88 20.15Z" fill="var(--modonty-knockout, hsl(var(--background)))" stroke="var(--modonty-knockout, hsl(var(--background)))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 18.38A0.5 0.5 0 0 1 12.35 18.38L14.12 20.15A0.5 0.5 0 0 1 14.12 20.85L12.35 22.62A0.5 0.5 0 0 1 11.65 22.62L9.88 20.85A0.5 0.5 0 0 1 9.88 20.15Z" fill="var(--modonty-notifications-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M4.25 8.75V5.5a3.75 3.75 0 0 1 7.5 0V8.75l1.25 1.5H3Z" fill="var(--modonty-notifications-body, currentColor)" stroke="var(--modonty-notifications-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 12.44A0.3 0.3 0 0 1 8.21 12.44L9.56 13.79A0.3 0.3 0 0 1 9.56 14.21L8.21 15.56A0.3 0.3 0 0 1 7.79 15.56L6.44 14.21A0.3 0.3 0 0 1 6.44 13.79Z" fill="var(--modonty-knockout, hsl(var(--background)))" stroke="var(--modonty-knockout, hsl(var(--background)))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 12.44A0.3 0.3 0 0 1 8.21 12.44L9.56 13.79A0.3 0.3 0 0 1 9.56 14.21L8.21 15.56A0.3 0.3 0 0 1 7.79 15.56L6.44 14.21A0.3 0.3 0 0 1 6.44 13.79Z" fill="var(--modonty-notifications-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
