import type { SVGProps } from "react";

/**
 * The modonty TRENDING mark — الرائج / الصاعد.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="trending"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: مسار تصاعدي صاعد بحواف ناعمة وسهم يمثل النمو، وذروة الانعطاف متمركزة على ماسة الارتفاع.
 *
 * Category: Analytics / Discovery · Viral content, trending topics, growth charts
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-trending-body` · `--modonty-trending-accent` (the diamond).
 */
export function ModontyTrendingMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M24 74L48 50L68 60L90 32" stroke="var(--modonty-trending-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M76 30H92V46" stroke="var(--modonty-trending-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="61" y="53" width="14" height="14" rx="2" transform="rotate(45 68 60)" fill="var(--modonty-trending-accent, hsl(var(--accent)))"/>
      <circle cx="24" cy="74" r="4" fill="var(--modonty-trending-body, currentColor)"/>
    </svg>
  );
}
