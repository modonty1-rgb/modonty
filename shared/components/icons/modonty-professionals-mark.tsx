import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty PROFESSIONALS mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-professionals-body` · `--modonty-professionals-accent` (the diamond).
 */
export function ModontyProfessionalsMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="9.5" cy="7.5" r="2.75" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 21v-1.5a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5V21" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="17" cy="6.75" r="2.25" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.25 13.5a4 4 0 0 1 4 4V19" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.15 16.63A0.5 0.5 0 0 1 9.85 16.63L11.62 18.4A0.5 0.5 0 0 1 11.62 19.1L9.85 20.87A0.5 0.5 0 0 1 9.15 20.87L7.38 19.1A0.5 0.5 0 0 1 7.38 18.4Z" fill="var(--modonty-professionals-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="6.25" cy="4.75" r="1.75" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.75 14v-1.75a3.25 3.25 0 0 1 3.25-3.25h.5a3.25 3.25 0 0 1 3.25 3.25V14" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11.75" cy="5" r="1.5" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.75 8.5a2 2 0 0 1 2 2V12" stroke="var(--modonty-professionals-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.04 10.69A0.3 0.3 0 0 1 6.46 10.69L7.81 12.04A0.3 0.3 0 0 1 7.81 12.46L6.46 13.81A0.3 0.3 0 0 1 6.04 13.81L4.69 12.46A0.3 0.3 0 0 1 4.69 12.04Z" fill="var(--modonty-professionals-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
