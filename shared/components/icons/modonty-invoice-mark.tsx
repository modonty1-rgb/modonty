import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty INVOICE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-invoice-body` · `--modonty-invoice-accent` (the diamond).
 */
export function ModontyInvoiceMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M5.5 5.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2V20.75L15.25 19L12 20.75L8.75 19L5.5 20.75Z" stroke="var(--modonty-invoice-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 9.5H13.5" stroke="var(--modonty-invoice-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.5 14.5H15.25" stroke="var(--modonty-invoice-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.15 7.38A0.5 0.5 0 0 1 13.85 7.38L15.62 9.15A0.5 0.5 0 0 1 15.62 9.85L13.85 11.62A0.5 0.5 0 0 1 13.15 11.62L11.38 9.85A0.5 0.5 0 0 1 11.38 9.15Z" fill="var(--modonty-invoice-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M3.5 4A1.5 1.5 0 0 1 5 2.5h6A1.5 1.5 0 0 1 12.5 4V13.5L10.25 12L8 13.5L5.75 12L3.5 13.5Z" stroke="var(--modonty-invoice-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 6H8.5" stroke="var(--modonty-invoice-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9.75H10" stroke="var(--modonty-invoice-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.29 4.44A0.3 0.3 0 0 1 8.71 4.44L10.06 5.79A0.3 0.3 0 0 1 10.06 6.21L8.71 7.56A0.3 0.3 0 0 1 8.29 7.56L6.94 6.21A0.3 0.3 0 0 1 6.94 5.79Z" fill="var(--modonty-invoice-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
