import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty COMPANY mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-company-body` · `--modonty-company-accent` (the diamond).
 */
export function ModontyCompanyMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="5.5" y="3.25" width="13" height="17.5" rx="2" stroke="var(--modonty-company-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 20.75V17.5a2 2 0 0 1 4 0V20.75" stroke="var(--modonty-company-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12.5h.01" stroke="var(--modonty-company-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 12.5h.01" stroke="var(--modonty-company-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 5.63A0.5 0.5 0 0 1 12.35 5.63L14.12 7.4A0.5 0.5 0 0 1 14.12 8.1L12.35 9.87A0.5 0.5 0 0 1 11.65 9.87L9.88 8.1A0.5 0.5 0 0 1 9.88 7.4Z" fill="var(--modonty-company-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="3.5" y="2" width="9" height="12" rx="1.5" stroke="var(--modonty-company-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 14V12.75a1.5 1.5 0 0 1 3 0V14" stroke="var(--modonty-company-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 9.25h.01" stroke="var(--modonty-company-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 9.25h.01" stroke="var(--modonty-company-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 3.94A0.3 0.3 0 0 1 8.21 3.94L9.56 5.29A0.3 0.3 0 0 1 9.56 5.71L8.21 7.06A0.3 0.3 0 0 1 7.79 7.06L6.44 5.71A0.3 0.3 0 0 1 6.44 5.29Z" fill="var(--modonty-company-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
