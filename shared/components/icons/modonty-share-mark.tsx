import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty SHARE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-share-body` · `--modonty-share-accent` (the diamond).
 */
export function ModontyShareMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="6" cy="6" r="2.5" stroke="var(--modonty-share-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="2.5" stroke="var(--modonty-share-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.24 7.12L18 12" stroke="var(--modonty-share-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.24 16.88L18 12" stroke="var(--modonty-share-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.65 9.88A0.5 0.5 0 0 1 18.35 9.88L20.12 11.65A0.5 0.5 0 0 1 20.12 12.35L18.35 14.12A0.5 0.5 0 0 1 17.65 14.12L15.88 12.35A0.5 0.5 0 0 1 15.88 11.65Z" fill="var(--modonty-share-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="4" cy="4" r="1.75" stroke="var(--modonty-share-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="12" r="1.75" stroke="var(--modonty-share-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.57 4.78L12 8" stroke="var(--modonty-share-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.57 11.22L12 8" stroke="var(--modonty-share-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.79 6.44A0.3 0.3 0 0 1 12.21 6.44L13.56 7.79A0.3 0.3 0 0 1 13.56 8.21L12.21 9.56A0.3 0.3 0 0 1 11.79 9.56L10.44 8.21A0.3 0.3 0 0 1 10.44 7.79Z" fill="var(--modonty-share-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
