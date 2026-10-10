import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty LIKE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-like-body` · `--modonty-like-accent` (the diamond).
 */
export function ModontyLikeMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 20.5C12 20.5 3.5 15.5 3.5 9.5A4.75 4.75 0 0 1 12 6.6A4.75 4.75 0 0 1 20.5 9.5C20.5 15.5 12 20.5 12 20.5Z" stroke="var(--modonty-like-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.63A0.5 0.5 0 0 1 12.35 9.63L14.12 11.4A0.5 0.5 0 0 1 14.12 12.1L12.35 13.87A0.5 0.5 0 0 1 11.65 13.87L9.88 12.1A0.5 0.5 0 0 1 9.88 11.4Z" fill="var(--modonty-like-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 13.5C8 13.5 2.5 10 2.5 6.25A3.25 3.25 0 0 1 8 4.2A3.25 3.25 0 0 1 13.5 6.25C13.5 10 8 13.5 8 13.5Z" stroke="var(--modonty-like-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.69A0.3 0.3 0 0 1 8.21 6.69L9.56 8.04A0.3 0.3 0 0 1 9.56 8.46L8.21 9.81A0.3 0.3 0 0 1 7.79 9.81L6.44 8.46A0.3 0.3 0 0 1 6.44 8.04Z" fill="var(--modonty-like-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
