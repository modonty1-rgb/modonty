import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty ARMCHAIR mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-armchair-body` · `--modonty-armchair-accent` (the diamond).
 */
export function ModontyArmchairMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="7.5" y="3.5" width="9" height="8.5" rx="2.5" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 12.5H6.5a2 2 0 0 0-2 2V17" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.5 12.5H17.5a2 2 0 0 1 2 2V17" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 17H19.5" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 17V19.5" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.5 17V19.5" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 5.63A0.5 0.5 0 0 1 12.35 5.63L14.12 7.4A0.5 0.5 0 0 1 14.12 8.1L12.35 9.87A0.5 0.5 0 0 1 11.65 9.87L9.88 8.1A0.5 0.5 0 0 1 9.88 7.4Z" fill="var(--modonty-armchair-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="4.75" y="1.75" width="6.5" height="6.5" rx="1.5" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.75 9H4a1.5 1.5 0 0 0-1.5 1.5V12" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.25 9H12a1.5 1.5 0 0 1 1.5 1.5V12" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 12H13.5" stroke="var(--modonty-armchair-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 3.44A0.3 0.3 0 0 1 8.21 3.44L9.56 4.79A0.3 0.3 0 0 1 9.56 5.21L8.21 6.56A0.3 0.3 0 0 1 7.79 6.56L6.44 5.21A0.3 0.3 0 0 1 6.44 4.79Z" fill="var(--modonty-armchair-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
