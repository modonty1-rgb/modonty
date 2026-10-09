import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty LOCATION mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-location-body` · `--modonty-location-accent` (the diamond).
 */
export function ModontyLocationMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 21C12 21 5.5 15.5 5.5 10a6.5 6.5 0 0 1 13 0C18.5 15.5 12 21 12 21Z" stroke="var(--modonty-location-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 7.88A0.5 0.5 0 0 1 12.35 7.88L14.12 9.65A0.5 0.5 0 0 1 14.12 10.35L12.35 12.12A0.5 0.5 0 0 1 11.65 12.12L9.88 10.35A0.5 0.5 0 0 1 9.88 9.65Z" fill="var(--modonty-location-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 14C8 14 3.5 10 3.5 6.5a4.5 4.5 0 0 1 9 0C12.5 10 8 14 8 14Z" stroke="var(--modonty-location-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 4.94A0.3 0.3 0 0 1 8.21 4.94L9.56 6.29A0.3 0.3 0 0 1 9.56 6.71L8.21 8.06A0.3 0.3 0 0 1 7.79 8.06L6.44 6.71A0.3 0.3 0 0 1 6.44 6.29Z" fill="var(--modonty-location-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
