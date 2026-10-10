import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty OFFERS mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-offers-body` · `--modonty-offers-accent` (the diamond).
 */
export function ModontyOffersMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="5.5" y="9.5" width="13" height="3" rx="1" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 12.5V18.5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V12.5" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9.5V20.5" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.9 6.15L7 3.25" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.1 6.15L17 3.25" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 3.13A0.5 0.5 0 0 1 12.35 3.13L14.12 4.9A0.5 0.5 0 0 1 14.12 5.6L12.35 7.37A0.5 0.5 0 0 1 11.65 7.37L9.88 5.6A0.5 0.5 0 0 1 9.88 4.9Z" fill="var(--modonty-offers-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="3.5" y="7" width="9" height="2.5" rx="0.75" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.75 9.5V12a1.5 1.5 0 0 0 1.5 1.5h3.5a1.5 1.5 0 0 0 1.5-1.5V9.5" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7V13.5" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.4 4.6L4.4 2.6" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.6 4.6L11.6 2.6" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 2.19A0.3 0.3 0 0 1 8.21 2.19L9.56 3.54A0.3 0.3 0 0 1 9.56 3.96L8.21 5.31A0.3 0.3 0 0 1 7.79 5.31L6.44 3.96A0.3 0.3 0 0 1 6.44 3.54Z" fill="var(--modonty-offers-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
