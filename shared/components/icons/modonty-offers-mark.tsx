import type { SVGProps } from "react";

/**
 * The modonty OFFERS / GIFT mark — العروض / الهدايا.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="offers"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: صندوق هدية باحتواء متين وشريط ربط رأسي، تعلوه فيونكة ماسية مضيئة.
 *
 * Category: Marketing / Promotion · Discounts, gift coupons, special offers
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-offers-body` · `--modonty-offers-accent` (the diamond).
 */
export function ModontyOffersMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <rect x="26" y="48" width="68" height="52" rx="8" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="8"/>
      <rect x="20" y="38" width="80" height="14" rx="4" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="6"/>
      <path d="M60 38V100" stroke="var(--modonty-offers-body, currentColor)" strokeWidth="8"/>
      <rect x="53" y="17" width="14" height="14" rx="2" transform="rotate(45 60 24)" fill="var(--modonty-offers-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
