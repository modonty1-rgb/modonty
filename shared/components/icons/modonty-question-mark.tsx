import type { SVGProps } from "react";

/**
 * The modonty QUESTION mark — an outlined speech bubble holding a question mark, with
 * the brand diamond as its dot (supplied by Khalid, 21 Aug 2026). The outlined twin of
 * `ModontyCommentMark`: use this for «اسأل» surfaces, that one for existing comments.
 * Same icon contract: `currentColor` + `1em` box, two CSS hooks —
 * `--modonty-question-body` (bubble + glyph) · `--modonty-question-accent` (the diamond).
 */
export function ModontyQuestionMark(props: SVGProps<SVGSVGElement>) {
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
        d="M30 21 H90 C96.6274 21 102 26.3726 102 33 V80 C102 86.6274 96.6274 92 90 92 H54 L36.5 105.5 C35.6893 106.126 34.6087 106.29 33.6506 105.93 C32.6924 105.57 32 104.739 32 103.715 V92 H30 C23.3726 92 18 86.6274 18 80 V33 C18 26.3726 23.3726 21 30 21 Z"
        stroke="var(--modonty-question-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M57.5 41 C57.5 33.8 62.4 29 68.5 29 C75 29 80 33.8 80 40 C80 45.6 76.8 49.1 72.1 51.8 C68.2 54 65.7 56.3 65.7 61 V63.5"
        stroke="var(--modonty-question-body, currentColor)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="57"
        y="70"
        width="14"
        height="14"
        rx="2.5"
        transform="rotate(45 64 77)"
        fill="var(--modonty-question-accent, currentColor)"
      />
    </svg>
  );
}
