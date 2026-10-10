import { useId } from "react";
import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty FEATURED mark. The «شريك مميّز» medal — gold rosette, dark star, dark «m» with its diamond — the approved
 * original, in its own fixed colours so it stands out wherever it sits. Not redrawn in v2: restored as-is.
 * The two boxes are the same drawing scaled (24 and 16), only so the v2 size switch and the mobile
 * generator (one <svg>, no transform) keep working — the shape itself is untouched.
 */
export function ModontyFeaturedMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  // One gradient id per instance: with a shared id the browser resolves `url(#…)` to the FIRST copy
  // on the page, and when that copy sits in a hidden layout the gold rosette renders empty.
  const gold = `modonty-featured-gold-${useId().replace(/:/g, "")}`;
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <defs><linearGradient id={gold} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F7C948" /><stop offset="1" stopColor="#D99A0B" /></linearGradient></defs>
        <path d="M12 2.4Q15.02 0.72 16.8 3.69 20.26 3.74 20.31 7.2 23.28 8.98 21.6 12 23.28 15.02 20.31 16.8 20.26 20.26 16.8 20.31 15.02 23.28 12 21.6 8.98 23.28 7.2 20.31 3.74 20.26 3.69 16.8 0.72 15.02 2.4 12 0.72 8.98 3.69 7.2 3.74 3.74 7.2 3.69 8.98 0.72 12 2.4Z" fill={`url(#${gold})`} />
        <path d="M12 5.16L12.65 6.48 14.09 6.7 13.06 7.7 13.3 9.14 12 8.47 10.7 9.14 10.94 7.7 9.91 6.7 11.35 6.48Z" fill="#4A3005" />
        <path d="M15.98 12.6V16.58H15.1V12.6C15.1 11.86 14.5 11.27 13.77 11.27 13.04 11.27 12.44 11.86 12.44 12.6V16.58H11.56V12.6C11.56 11.86 10.96 11.27 10.23 11.27 9.49 11.27 8.9 11.86 8.9 12.6V14.81H8.02V12.6C8.02 12.45 8.03 12.3 8.06 12.15 8.13 11.83 8.26 11.53 8.46 11.27 8.58 11.1 8.73 10.95 8.9 10.83 9.27 10.55 9.73 10.38 10.23 10.38 10.73 10.38 11.19 10.55 11.56 10.83 11.73 10.95 11.87 11.1 12 11.27 12.13 11.1 12.28 10.95 12.45 10.83 12.82 10.55 13.27 10.38 13.77 10.38 14.27 10.38 14.73 10.55 15.1 10.83 15.27 10.95 15.42 11.1 15.54 11.27 15.74 11.53 15.88 11.83 15.94 12.15 15.97 12.3 15.99 12.45 15.99 12.6Z" fill="#4A3005" />
        <path d="M7.83 16.14L8.46 15.51 9.08 16.14 8.46 16.76Z" fill="#4A3005" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <defs><linearGradient id={gold} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F7C948" /><stop offset="1" stopColor="#D99A0B" /></linearGradient></defs>
      <path d="M8 1.6Q10.01 0.48 11.2 2.46 13.51 2.49 13.54 4.8 15.52 5.99 14.4 8 15.52 10.01 13.54 11.2 13.51 13.51 11.2 13.54 10.01 15.52 8 14.4 5.99 15.52 4.8 13.54 2.49 13.51 2.46 11.2 0.48 10.01 1.6 8 0.48 5.99 2.46 4.8 2.49 2.49 4.8 2.46 5.99 0.48 8 1.6Z" fill={`url(#${gold})`} />
      <path d="M8 3.44L8.43 4.32 9.39 4.46 8.7 5.14 8.86 6.1 8 5.65 7.14 6.1 7.3 5.14 6.61 4.46 7.57 4.32Z" fill="#4A3005" />
      <path d="M10.66 8.4V11.05H10.07V8.4C10.07 7.91 9.67 7.51 9.18 7.51 8.69 7.51 8.29 7.91 8.29 8.4V11.05H7.71V8.4C7.71 7.91 7.31 7.51 6.82 7.51 6.33 7.51 5.93 7.91 5.93 8.4V9.87H5.34V8.4C5.34 8.3 5.35 8.2 5.37 8.1 5.42 7.88 5.51 7.68 5.64 7.51 5.72 7.4 5.82 7.3 5.93 7.22 6.18 7.03 6.49 6.92 6.82 6.92 7.15 6.92 7.46 7.03 7.71 7.22 7.82 7.3 7.92 7.4 8 7.51 8.08 7.4 8.18 7.3 8.3 7.22 8.54 7.03 8.85 6.92 9.18 6.92 9.51 6.92 9.82 7.03 10.07 7.22 10.18 7.3 10.28 7.4 10.36 7.51 10.49 7.68 10.58 7.88 10.63 8.1 10.65 8.2 10.66 8.3 10.66 8.4Z" fill="#4A3005" />
      <path d="M5.22 10.76L5.64 10.34 6.06 10.76 5.64 11.18Z" fill="#4A3005" />
    </svg>
  );
}
