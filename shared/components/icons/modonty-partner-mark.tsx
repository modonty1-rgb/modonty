import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty PARTNER mark. The «M» with the diamond above it — the approved original (supplied by Khalid, 21 Aug 2026:
 * «keep this as icon for partner»). Not redrawn in v2: restored as-is.
 * The two boxes are the same drawing scaled (24 and 16), only so the v2 size switch and the mobile
 * generator (one <svg>, no transform) keep working — the shape itself is untouched.
 */
export function ModontyPartnerMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12.57 2.57L14.55 4.55A0.8 0.8 0 0 1 14.55 5.68L12.57 7.66A0.8 0.8 0 0 1 11.43 7.66L9.45 5.68A0.8 0.8 0 0 1 9.45 4.55L11.43 2.57A0.8 0.8 0 0 1 12.57 2.57Z" fill="var(--modonty-partner-accent, var(--modonty-accent, #00D8D8))" />
        <path d="M3.6 18.8V11.4C3.6 9.8 5.2 9 6.4 10.2L10.4 14.2C11.4 15.2 12.6 15.2 13.6 14.2L17.6 10.2C18.8 9 20.4 9.8 20.4 11.4V18.8" stroke="var(--modonty-partner-body, currentColor)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8.38 1.71L9.7 3.03A0.53 0.53 0 0 1 9.7 3.78L8.38 5.1A0.53 0.53 0 0 1 7.62 5.1L6.3 3.78A0.53 0.53 0 0 1 6.3 3.03L7.62 1.71A0.53 0.53 0 0 1 8.38 1.71Z" fill="var(--modonty-partner-accent, var(--modonty-accent, #00D8D8))" />
      <path d="M2.4 12.53V7.6C2.4 6.53 3.47 6 4.27 6.8L6.93 9.47C7.6 10.13 8.4 10.13 9.07 9.47L11.73 6.8C12.53 6 13.6 6.53 13.6 7.6V12.53" stroke="var(--modonty-partner-body, currentColor)" strokeWidth="1.73" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
