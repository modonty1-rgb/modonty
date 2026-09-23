import type { ClientPaymentState } from "./get-payment-states";

/**
 * كلمةُ الشارة — مفردةٌ واحدة لكلّ الشاشات (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
 *
 * «مدفوع» كلمةُ الطلب نفسُها (`PAID`)، لا «مسدَّد»؛ و«عليه مستحقّات» لا «فاتورةٌ غير مسدَّدة» —
 * الفاتورةُ لها اسمُها في `INVOICE_STATUS_LABEL`، وهذه شارةُ العميل. ولا طلبَ ساري ← «—»:
 * سكوتٌ صريح، لا «مدفوع» ولا «بلا فواتير».
 */
export function paymentStateLabel(state: ClientPaymentState): string {
  switch (state.status) {
    case "OWES":
      return "عليه مستحقّات";
    case "PAID":
      return "مدفوع";
    case "REFUNDED":
      return "مسترد";
    default:
      return "—";
  }
}

/** لون الشارة — الأخضرُ للطلب المدفوع وحده، والأحمرُ لمن عليه مستحقّات، والرماديّ لما سواهما. */
export function paymentStateTone(state: ClientPaymentState): "go" | "stop" | "muted" {
  if (state.status === "OWES") return "stop";
  return state.status === "PAID" ? "go" : "muted";
}
