import type { SVGProps } from "react";

/**
 * The modonty REELS / VIDEO mark — ريلز / مقاطع الفيديو.
 *
 * Third drawing, 22 Aug 2026. The history matters because each version failed for a
 * measurable reason, not a taste one:
 *
 * 1. The approved original (`data-icon-id="reels"`) drew a film strip: a square frame with
 *    two full-width rails and four sprocket ticks, all at 6px. This mark ships at 20px in
 *    the phone tab strip, where one unit is 0.167px — so every line landed at 1px with
 *    gaps thinner than the lines, and the strip fused into a GRID. The reference's own
 *    Geometry Standard forbids exactly that: "No micro-lines that collapse below 18px".
 * 2. Cutting it back to one rail fixed the legibility and broke the meaning — a square
 *    frame with a bar across the top is a WINDOW, and Khalid read it as one immediately:
 *    «not video at all».
 *
 * So the silhouette carries the meaning now, not the internal detail. A PORTRAIT frame
 * says «reel» before anything inside it is resolved — a short vertical video is the one
 * screen shape nothing else on this site uses (every other frame here is square or wide),
 * and it is the shape the whole format is known by. The solid play triangle then confirms
 * it in one element instead of six, and a filled shape survives any size a stroke does not.
 *
 * The diamond moved OUT to the frame's top corner. Inside, it competed with the triangle
 * for the same centre and the eye read two symbols; on the corner it does what it does on
 * `bookmark` and `audio` — signs the mark without being read as part of it.
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box, two CSS hooks
 * — `--modonty-reels-body` · `--modonty-reels-accent` (the diamond).
 */
export function ModontyReelsMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="34"
        y="18"
        width="52"
        height="84"
        rx="14"
        stroke="var(--modonty-reels-body, currentColor)"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      {/* Solid, not stroked. A 8px-stroked triangle at 20px leaves a 3px hole in the middle
          and reads as an outline of nothing; filled, it stays a triangle at any size. */}
      <path
        d="M52 44L76 60L52 76Z"
        fill="var(--modonty-reels-body, currentColor)"
        stroke="var(--modonty-reels-body, currentColor)"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <rect
        x="79"
        y="11"
        width="14"
        height="14"
        rx="2"
        transform="rotate(45 86 18)"
        fill="var(--modonty-reels-accent, hsl(var(--accent)))"
      />
    </svg>
  );
}
