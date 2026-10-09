import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty TRUST mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-trust-body` · `--modonty-trust-accent` (the diamond).
 */
export function ModontyTrustMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 3.5L19 6V11C19 15.5 16 18.75 12 20.5C8 18.75 5 15.5 5 11V6Z" stroke="var(--modonty-trust-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.38A0.5 0.5 0 0 1 12.35 9.38L14.12 11.15A0.5 0.5 0 0 1 14.12 11.85L12.35 13.62A0.5 0.5 0 0 1 11.65 13.62L9.88 11.85A0.5 0.5 0 0 1 9.88 11.15Z" fill="var(--modonty-trust-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 2L13 4V7.5C13 10.5 10.8 12.8 8 14C5.2 12.8 3 10.5 3 7.5V4Z" stroke="var(--modonty-trust-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 5.94A0.3 0.3 0 0 1 8.21 5.94L9.56 7.29A0.3 0.3 0 0 1 9.56 7.71L8.21 9.06A0.3 0.3 0 0 1 7.79 9.06L6.44 7.71A0.3 0.3 0 0 1 6.44 7.29Z" fill="var(--modonty-trust-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
