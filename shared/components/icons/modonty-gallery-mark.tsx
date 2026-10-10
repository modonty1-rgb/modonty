import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty GALLERY mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-gallery-body` · `--modonty-gallery-accent` (the diamond).
 */
export function ModontyGalleryMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="5" y="4.75" width="14" height="13.25" rx="2" stroke="var(--modonty-gallery-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 15.5L9.5 11L19 16.5" stroke="var(--modonty-gallery-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.15 7.08A0.5 0.5 0 0 1 14.85 7.08L16.62 8.85A0.5 0.5 0 0 1 16.62 9.55L14.85 11.32A0.5 0.5 0 0 1 14.15 11.32L12.38 9.55A0.5 0.5 0 0 1 12.38 8.85Z" fill="var(--modonty-gallery-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="2.75" y="2.75" width="10.5" height="10" rx="2" stroke="var(--modonty-gallery-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.75 10.5L5.75 7.5L8 9.75" stroke="var(--modonty-gallery-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.59 4.64A0.3 0.3 0 0 1 10.01 4.64L11.36 5.99A0.3 0.3 0 0 1 11.36 6.41L10.01 7.76A0.3 0.3 0 0 1 9.59 7.76L8.24 6.41A0.3 0.3 0 0 1 8.24 5.99Z" fill="var(--modonty-gallery-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
