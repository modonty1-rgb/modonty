import type { SVGProps } from "react";

/**
 * The modonty SECURE PAYMENT mark — الدفع الآمن / الحماية.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="payment"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: درع حماية متين يضم قفلاً مدمجاً، وتفتح أمانه ماسة مدونتي الموثوقة.
 *
 * Category: Security / Financial · SSL security, payment gateway, fraud protection
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-payment-body` · `--modonty-payment-accent` (the diamond).
 */
export function ModontyPaymentMark(props: SVGProps<SVGSVGElement>) {
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
      <path d="M60 20L92 32V60C92 80 78 96 60 102C42 96 28 80 28 60V32L60 20Z" stroke="var(--modonty-payment-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M50 54V46C50 40.5 54.5 36 60 36C65.5 36 70 40.5 70 46V54" stroke="var(--modonty-payment-body, currentColor)" strokeWidth="6" strokeLinecap="round"/>
      <rect x="53" y="57" width="14" height="14" rx="2" transform="rotate(45 60 64)" fill="var(--modonty-payment-accent, hsl(var(--accent)))"/>
      <path d="M60 70V78" stroke="var(--modonty-payment-accent, hsl(var(--accent)))" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}
