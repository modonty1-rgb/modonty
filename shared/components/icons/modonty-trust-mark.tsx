import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty TRUST mark. The verified badge — navy shield, white «m», teal diamond — the approved original, in its own fixed
 * colours. Not redrawn in v2: restored as-is.
 * The two boxes are the same drawing scaled (24 and 16), only so the v2 size switch and the mobile
 * generator (one <svg>, no transform) keep working — the shape itself is untouched.
 */
export function ModontyTrustMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 1.2L20.64 4.56V11.52C20.64 17.04 17.52 20.88 12 23.04 6.48 20.88 3.36 17.04 3.36 11.52V4.56L12 1.2Z" fill="#0B0A5C" stroke="#00D8D8" strokeWidth="0.72" />
        <path d="M17.86 10.62V16.48H16.56V10.62C16.56 9.54 15.68 8.66 14.6 8.66 13.52 8.66 12.65 9.54 12.65 10.62V16.48H11.35V10.62C11.35 9.54 10.47 8.66 9.4 8.66 8.32 8.66 7.44 9.54 7.44 10.62V13.87H6.14V10.62C6.14 10.39 6.16 10.18 6.21 9.96 6.3 9.48 6.51 9.04 6.79 8.66 6.98 8.42 7.2 8.2 7.44 8.01 7.99 7.6 8.66 7.36 9.4 7.36 10.13 7.36 10.8 7.6 11.35 8.01 11.6 8.19 11.82 8.41 12 8.66 12.19 8.42 12.41 8.2 12.66 8.01 13.2 7.6 13.87 7.36 14.61 7.36 15.34 7.36 16.02 7.6 16.56 8.01 16.81 8.19 17.03 8.41 17.21 8.66 17.5 9.04 17.7 9.48 17.8 9.96 17.84 10.18 17.87 10.39 17.87 10.62Z" fill="#F3F3F3" />
        <path d="M5.87 15.82L6.79 14.9 7.71 15.82 6.79 16.74Z" fill="#00D8D8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 0.8L13.76 3.04V7.68C13.76 11.36 11.68 13.92 8 15.36 4.32 13.92 2.24 11.36 2.24 7.68V3.04L8 0.8Z" fill="#0B0A5C" stroke="#00D8D8" strokeWidth="0.48" />
      <path d="M11.91 7.08V10.98H11.04V7.08C11.04 6.36 10.45 5.77 9.74 5.77 9.02 5.77 8.43 6.36 8.43 7.08V10.98H7.57V7.08C7.57 6.36 6.98 5.77 6.26 5.77 5.54 5.77 4.96 6.36 4.96 7.08V9.25H4.09V7.08C4.09 6.93 4.11 6.78 4.14 6.64 4.2 6.32 4.34 6.03 4.53 5.77 4.65 5.61 4.8 5.47 4.96 5.34 5.32 5.07 5.78 4.91 6.27 4.91 6.75 4.91 7.2 5.07 7.57 5.34 7.73 5.46 7.88 5.61 8 5.77 8.12 5.61 8.27 5.47 8.44 5.34 8.8 5.07 9.25 4.91 9.74 4.91 10.23 4.91 10.68 5.07 11.04 5.34 11.2 5.46 11.35 5.61 11.48 5.77 11.66 6.03 11.8 6.32 11.87 6.64 11.9 6.78 11.91 6.93 11.91 7.08Z" fill="#F3F3F3" />
      <path d="M3.91 10.55L4.53 9.94 5.14 10.55 4.53 11.16Z" fill="#00D8D8" />
    </svg>
  );
}
