import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty LOADING mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-loading-body` · `--modonty-loading-accent` (the diamond).
 */
export function ModontyLoadingMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 4A8 8 0 1 1 4 12" stroke="var(--modonty-loading-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.99 4.22A0.5 0.5 0 0 1 6.69 4.22L8.46 5.99A0.5 0.5 0 0 1 8.46 6.69L6.69 8.46A0.5 0.5 0 0 1 5.99 8.46L4.22 6.69A0.5 0.5 0 0 1 4.22 5.99Z" fill="var(--modonty-loading-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 2.5A5.5 5.5 0 1 1 2.5 8" stroke="var(--modonty-loading-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.9 2.55A0.3 0.3 0 0 1 4.32 2.55L5.67 3.9A0.3 0.3 0 0 1 5.67 4.32L4.32 5.67A0.3 0.3 0 0 1 3.9 5.67L2.55 4.32A0.3 0.3 0 0 1 2.55 3.9Z" fill="var(--modonty-loading-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
