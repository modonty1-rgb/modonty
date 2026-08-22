import type { SVGProps } from "react";

/**
 * The modonty AUDIO mark — the reels frame with a speaker inside instead of a play
 * triangle (Khalid, 22 Aug: «create a branding speaker, same pattern»). It is deliberately
 * the same body as `modonty-reels-mark`: the two sit next to each other in the phone bar,
 * and a family reads as a family only when the shell is identical and just the glyph
 * changes. Same contract as the rest of the marks: `currentColor` + a `1em` box, two CSS
 * hooks — `--modonty-audio-body` (frame + speaker) · `--modonty-audio-accent` (the diamond).
 */
export function ModontyAudioMark(props: SVGProps<SVGSVGElement>) {
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
      <path
        d="M87 30 H46 C32 30 24 38 24 52 V84 C24 96 32 104 44 104 H80 C92 104 100 96 100 84 V52"
        stroke="var(--modonty-audio-body, currentColor)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Glyph kept to the same box the reels triangle occupies (~26×32 around the frame's
          centre). A speaker drawn any larger fills the frame and the mark stops reading as
          «a thing inside a window» — which is the whole shape of this family. */}
      <path
        d="M46 60 H54 L64 50 V84 L54 74 H46 C43.8 74 42 72.2 42 70 V64 C42 61.8 43.8 60 46 60 Z"
        fill="var(--modonty-audio-body, currentColor)"
        stroke="var(--modonty-audio-body, currentColor)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M71 59 C75 63.5 75 70.5 71 75"
        stroke="var(--modonty-audio-body, currentColor)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M79 53 C85 60 85 74 79 81"
        stroke="var(--modonty-audio-body, currentColor)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <rect
        x="91"
        y="23"
        width="17"
        height="17"
        rx="3.5"
        transform="rotate(45 91 23)"
        fill="var(--modonty-audio-accent, currentColor)"
      />
    </svg>
  );
}
