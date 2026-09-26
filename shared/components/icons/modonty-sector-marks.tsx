import type { SVGProps } from "react";

/**
 * The five sector marks for the «اكتشف القطاعات» row on `/modonty` (24 Sep 2026).
 *
 * DRAFTS — not in `documents/design/modonty_icon_system_MASTER_COMPLETE.html`, which has no
 * football, market, entertainment, education or health mark. Drawn on the set's own grid so
 * they sit beside the approved marks without looking borrowed: 120 box, 8px round stroke in
 * `currentColor`, and the brand diamond (`rx 2`-style rounded square at 45°) in teal as the
 * one accent. Replace with the approved versions once they are added to the master file.
 *
 * AI is not here — it already has an approved mark (`ModontyAiMark` → `IconAi`).
 */

const stroke = {
  stroke: "currentColor",
  strokeWidth: 8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const accent = "var(--modonty-accent, #00d8d8)";

/** الكورة — a ball whose seams radiate from the diamond at its centre. */
export function ModontyFootballMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <circle cx="60" cy="60" r="42" {...stroke} />
      <path d="M60 40V18M79 54L100 47M72 77L85 94M48 77L35 94M41 54L20 47" {...stroke} />
      <rect x="50" y="50" width="20" height="20" rx="4" transform="rotate(45 60 60)" fill={accent} />
    </svg>
  );
}

/** المال والاستثمار — three rising bars, the diamond above the tallest. */
export function ModontyMarketsMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <path d="M18 102H102" {...stroke} />
      <path d="M34 86V70M60 86V54M86 86V42" {...stroke} strokeWidth={14} />
      <rect x="78" y="14" width="16" height="16" rx="3" transform="rotate(45 86 22)" fill={accent} />
    </svg>
  );
}

/** الترفيه — a screen on its stand, the diamond as what is playing. */
export function ModontyEntertainmentMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <rect x="16" y="34" width="88" height="60" rx="12" {...stroke} />
      <path d="M44 16L60 34L76 16M42 106H78" {...stroke} />
      <rect x="51" y="55" width="18" height="18" rx="4" transform="rotate(45 60 64)" fill={accent} />
    </svg>
  );
}

/** التعليم والوظائف — a graduation cap, the diamond as the tassel. */
export function ModontyEducationMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <path d="M60 22L106 44L60 66L14 44Z" {...stroke} />
      <path d="M34 56V78C34 86 46 94 60 94S86 86 86 78V56M106 44V74" {...stroke} />
      <rect x="99" y="82" width="14" height="14" rx="3" transform="rotate(45 106 89)" fill={accent} />
    </svg>
  );
}

/** القرآن الكريم — an open mushaf, the diamond resting above its spine (added 26 Sep 2026). */
export function ModontyQuranMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <path
        d="M60 42C49 34 32 32 16 36V94C32 90 49 92 60 100C71 92 88 90 104 94V36C88 32 71 34 60 42Z"
        {...stroke}
      />
      <path d="M60 42V100" {...stroke} />
      <rect x="52" y="12" width="16" height="16" rx="3" transform="rotate(45 60 20)" fill={accent} />
    </svg>
  );
}

/**
 * عجلة الحظ — a prize wheel: six segments, every other one filled, the diamond as the pointer
 * above it (added 26 Sep 2026). The filled segments are what tell it apart from the football
 * mark at 24px — both are a circle with spokes, and the first draft of this one read as a ball.
 */
export function ModontyLuckyWheelMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <path
        d="M60 66L60 24A42 42 0 0 1 96.4 45ZM60 66L96.4 87A42 42 0 0 1 60 108ZM60 66L23.6 87A42 42 0 0 1 23.6 45Z"
        fill="currentColor"
      />
      <circle cx="60" cy="66" r="42" {...stroke} />
      <path d="M60 24V108M23.6 45L96.4 87M23.6 87L96.4 45" {...stroke} strokeWidth={5} />
      <rect x="52" y="4" width="16" height="16" rx="3" transform="rotate(45 60 12)" fill={accent} />
    </svg>
  );
}

/**
 * تعلّم — a light bulb, the diamond as its spark (added 26 Sep 2026, for the value row on the
 * `/modonty` phone landing). The registry's `IconLightbulb` is the AI mark under another name,
 * so it could not stand for "learn" next to the real AI tile.
 */
export function ModontyIdeaMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <path d="M44 78C35 71 30 61 30 51C30 34 43 22 60 22C77 22 90 34 90 51C90 61 85 71 76 78V86H44Z" {...stroke} />
      <path d="M46 98H74M52 108H68" {...stroke} />
      <rect x="53" y="41" width="14" height="14" rx="3" transform="rotate(45 60 48)" fill={accent} />
    </svg>
  );
}

/** الصحة والجمال — a heart carrying a pulse, the diamond at the pulse's peak. */
export function ModontyHealthMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" aria-hidden="true" {...props}>
      <path
        d="M60 102C22 80 12 62 12 45C12 30 24 19 38 19C48 19 56 25 60 33C64 25 72 19 82 19C96 19 108 30 108 45C108 62 98 80 60 102Z"
        {...stroke}
      />
      <path d="M26 60H44L52 48M60 74L68 60H94" {...stroke} />
      <rect x="47" y="45" width="14" height="14" rx="3" transform="rotate(45 54 52)" fill={accent} />
    </svg>
  );
}
