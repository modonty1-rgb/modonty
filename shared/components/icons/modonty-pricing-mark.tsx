import type { SVGProps } from "react";

/**
 * The modonty PACKAGE / PRICING mark — الباقات / الأسعار.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="pricing"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: ثلاثة أعمدة ترمز لباقات الاشتراك المتصاعدة، تعلو الباقة الأعلى ميزة ماسة التميز الاحترافية.
 *
 * Category: Subscription / Plans · SaaS plans, tier pricing, feature comparison
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-pricing-body` · `--modonty-pricing-accent` (the diamond).
 */
export function ModontyPricingMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <rect x="22" y="58" width="22" height="40" rx="4" stroke="var(--modonty-pricing-body, currentColor)" strokeWidth="6"/>
      <rect x="49" y="42" width="22" height="56" rx="4" stroke="var(--modonty-pricing-body, currentColor)" strokeWidth="6"/>
      <rect x="76" y="26" width="22" height="72" rx="4" stroke="var(--modonty-pricing-body, currentColor)" strokeWidth="6"/>
      <rect x="80" y="34" width="14" height="14" rx="2" transform="rotate(45 87 41)" fill="var(--modonty-pricing-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
