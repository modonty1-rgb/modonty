import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty PAYMENT mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-payment-body` · `--modonty-payment-accent` (the diamond).
 */
export function ModontyPaymentMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="var(--modonty-payment-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 9.5H20.5" stroke="var(--modonty-payment-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.4 11.88A0.5 0.5 0 0 1 16.1 11.88L17.87 13.65A0.5 0.5 0 0 1 17.87 14.35L16.1 16.12A0.5 0.5 0 0 1 15.4 16.12L13.63 14.35A0.5 0.5 0 0 1 13.63 13.65Z" fill="var(--modonty-payment-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="3" y="4" width="10" height="8.5" rx="1.5" stroke="var(--modonty-payment-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 5.75H13" stroke="var(--modonty-payment-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.54 7.54A0.3 0.3 0 0 1 9.96 7.54L11.31 8.89A0.3 0.3 0 0 1 11.31 9.31L9.96 10.66A0.3 0.3 0 0 1 9.54 10.66L8.19 9.31A0.3 0.3 0 0 1 8.19 8.89Z" fill="var(--modonty-payment-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}
