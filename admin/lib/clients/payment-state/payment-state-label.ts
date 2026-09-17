import type { ClientPaymentState } from "./get-payment-states";

/**
 * النصّ العربيّ للحالة. «بلا فواتير» تُقال كما هي ولا تُترجم إلى «مدفوع» —
 * فالطيّ هو الكذبة التي أسقطت `Client.paymentStatus`.
 */
export function paymentStateLabel(state: ClientPaymentState): string {
  if (state.status === "NO_INVOICES") return "بلا فواتير";
  if (state.status === "PAID") return "مسدَّد";
  return state.unpaidCount === 1 ? "فاتورةٌ غير مسدَّدة" : `${state.unpaidCount} فواتير غير مسدَّدة`;
}

/** لون الشارة — ورماديّ لـ«بلا فواتير»: ليست خبراً سيّئاً ولا حسناً. */
export function paymentStateTone(state: ClientPaymentState): "go" | "stop" | "muted" {
  if (state.status === "NO_INVOICES") return "muted";
  return state.status === "PAID" ? "go" : "stop";
}
