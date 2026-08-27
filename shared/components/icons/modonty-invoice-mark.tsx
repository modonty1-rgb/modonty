import type { SVGProps } from "react";

/**
 * The modonty INVOICE / RECEIPT mark — الفاتورة / الإيصال.
 *
 * Traced verbatim from the approved original in
 * `documents/design/modonty_icon_system_MASTER_COMPLETE.html` (`data-icon-id="invoice"`),
 * which that file names the single source of truth: "لا يتم إعادة تصميم الأيقونة أثناء
 * مرحلة SVG". Nothing here was redrawn — only the colours became CSS hooks and the
 * attributes became JSX.
 *
 * Approved concept: ورقة فاتورة كلاسيكية بقاعدة مسننة، تتضمن أسطر البيانات وختم المصادقة الماسي.
 *
 * Category: Billing / Financial · Subscription receipts, billing invoices, purchase history
 *
 * Icon contract, same as the rest of the set: `currentColor` + a `1em` box so the mark
 * takes the size and colour of the text around it, two CSS hooks — `--modonty-invoice-body` · `--modonty-invoice-accent` (the diamond).
 */
export function ModontyInvoiceMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <path d="M30 20H90V96L80 90L70 96L60 90L50 96L40 90L30 96V20Z" stroke="var(--modonty-invoice-body, currentColor)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M44 38H76M44 50H76" stroke="var(--modonty-invoice-body, currentColor)" strokeWidth="6" strokeLinecap="round"/>
      <rect x="53" y="65" width="14" height="14" rx="2" transform="rotate(45 60 72)" fill="var(--modonty-invoice-accent, hsl(var(--accent)))"/>
    </svg>
  );
}
