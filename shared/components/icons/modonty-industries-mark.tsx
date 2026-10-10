import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty INDUSTRIES mark. Three equal gateways meeting around the modonty diamond — the approved original (Khalid, 21 Aug 2026;
 * source of truth `shared/assets/brand/modonty-industries-mark.svg`). Not redrawn in v2: restored as-is.
 * The two boxes are the same drawing scaled (24 and 16), only so the v2 size switch and the mobile
 * generator (one <svg>, no transform) keep working — the shape itself is untouched.
 */
export function ModontyIndustriesMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M8.4 7.2V5.28A3.6 2.88 0 0 1 15.6 5.28V7.2" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="2.04" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.96 11.28L19.62 12.24A2.88 3.6 30 0 1 16.02 18.48L14.36 17.52" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="2.04" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.64 17.52L7.98 18.48A3.6 2.88 60 0 1 4.38 12.24L6.04 11.28" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="2.04" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9.45L14.55 12 12 14.55 9.45 12Z" fill="var(--modonty-industries-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M5.6 4.8V3.52A2.4 1.92 0 0 1 10.4 3.52V4.8" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="1.36" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.97 7.52L13.08 8.16A1.92 2.4 30 0 1 10.68 12.32L9.57 11.68" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="1.36" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.43 11.68L5.32 12.32A2.4 1.92 60 0 1 2.92 8.16L4.03 7.52" stroke="var(--modonty-industries-body, currentColor)" strokeWidth="1.36" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6.3L9.7 8 8 9.7 6.3 8Z" fill="var(--modonty-industries-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
