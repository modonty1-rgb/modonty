import type { SVGProps } from "react";

/**
 * The modonty AUDIO mark — «اسمع», the audio-version badge on an article card.
 *
 * NOT in the approved 38, so it follows the file's Geometry Standard: 120 canvas · 8px
 * main stroke · 7px for the wave, which the standard allows for secondary detail · round
 * caps and joins · inside the 16px safe margin.
 *
 * Speaker, one wave, and the diamond where a second wave would be — the diamond IS the
 * sound leaving the speaker, which is the Diamond Role the reference asks for ("a
 * functional node, status marker, central trigger"). Two arcs plus a diamond would be the
 * micro-detail the standard forbids below 18px, so the outer arc became the signature
 * instead of sitting beside it.
 *
 * The two parts are meant to be coloured SEPARATELY (Khalid, 22 Aug: «the speaker itself
 * with the muted colour and the dot with our branding colour»): the body inherits
 * `currentColor` so a caller can keep it quiet, and the diamond ignores it and takes the
 * brand accent. On the feed card that reads as a quiet grey speaker with one teal spark —
 * the badge stays a footnote, and the brand is what your eye catches.
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box, two CSS hooks
 * — `--modonty-audio-body` · `--modonty-audio-accent` (the diamond).
 */
export function ModontyAudioMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M30 48H46L66 28V92L46 72H30C25.6 72 22 68.4 22 64V56C22 51.6 25.6 48 30 48Z"
        stroke="var(--modonty-audio-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M80 46C88 54 88 66 80 74"
        stroke="var(--modonty-audio-body, currentColor)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect
        x="93"
        y="53"
        width="14"
        height="14"
        rx="2"
        transform="rotate(45 100 60)"
        fill="var(--modonty-audio-accent, hsl(var(--accent)))"
      />
    </svg>
  );
}
