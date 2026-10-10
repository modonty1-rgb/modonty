import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty PHONE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-phone-body` · `--modonty-phone-accent` (the diamond).
 */
export function ModontyPhoneMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M20.2 16.03v2.46a1.64 1.64 0 0 1-1.79 1.64 16.23 16.23 0 0 1-7.08-2.52 15.99 15.99 0 0 1-4.92-4.92 16.23 16.23 0 0 1-2.52-7.11A1.64 1.64 0 0 1 5.53 3.8h2.46a1.64 1.64 0 0 1 1.64 1.41 10.53 10.53 0 0 0 .57 2.3 1.64 1.64 0 0 1-.37 1.73L8.79 10.29a13.12 13.12 0 0 0 4.92 4.92l1.04-1.04a1.64 1.64 0 0 1 1.73-.37 10.53 10.53 0 0 0 2.3.57A1.64 1.64 0 0 1 20.2 16.03Z" stroke="var(--modonty-phone-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.15 6.38A0.5 0.5 0 0 1 15.85 6.38L17.62 8.15A0.5 0.5 0 0 1 17.62 8.85L15.85 10.62A0.5 0.5 0 0 1 15.15 10.62L13.38 8.85A0.5 0.5 0 0 1 13.38 8.15Z" fill="var(--modonty-phone-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M14 10.95v1.8a1.2 1.2 0 0 1-1.31 1.2 11.87 11.87 0 0 1-5.18-1.84 11.7 11.7 0 0 1-3.6-3.6 11.87 11.87 0 0 1-1.84-5.2A1.2 1.2 0 0 1 3.27 2h1.8a1.2 1.2 0 0 1 1.2 1.03 7.7 7.7 0 0 0 .42 1.69 1.2 1.2 0 0 1-.27 1.27L5.65 6.75a9.6 9.6 0 0 0 3.6 3.6l.76-.76a1.2 1.2 0 0 1 1.27-.27 7.7 7.7 0 0 0 1.69.42A1.2 1.2 0 0 1 14 10.95Z" stroke="var(--modonty-phone-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.54 3.69A0.3 0.3 0 0 1 10.96 3.69L12.31 5.04A0.3 0.3 0 0 1 12.31 5.46L10.96 6.81A0.3 0.3 0 0 1 10.54 6.81L9.19 5.46A0.3 0.3 0 0 1 9.19 5.04Z" fill="var(--modonty-phone-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
