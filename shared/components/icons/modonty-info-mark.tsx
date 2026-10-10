import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty INFO mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-info-body` · `--modonty-info-accent` (the diamond).
 */
export function ModontyInfoMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="12" cy="12" r="8" stroke="var(--modonty-info-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12.75V16.5" stroke="var(--modonty-info-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 6.28A0.5 0.5 0 0 1 12.35 6.28L14.12 8.05A0.5 0.5 0 0 1 14.12 8.75L12.35 10.52A0.5 0.5 0 0 1 11.65 10.52L9.88 8.75A0.5 0.5 0 0 1 9.88 8.05Z" fill="var(--modonty-info-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="8" cy="8" r="6" stroke="var(--modonty-info-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9V11.75" stroke="var(--modonty-info-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 3.94A0.3 0.3 0 0 1 8.21 3.94L9.56 5.29A0.3 0.3 0 0 1 9.56 5.71L8.21 7.06A0.3 0.3 0 0 1 7.79 7.06L6.44 5.71A0.3 0.3 0 0 1 6.44 5.29Z" fill="var(--modonty-info-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
