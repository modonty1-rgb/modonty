import { formatOrderMoney } from "@/lib/subscription/active-order";
import type { CurrencyTotal } from "./totals-by-currency";

/** «٢٬٣٩٤ ر.س · ٥٠٠ ج.م» — كلُّ عملةٍ بمبلغها بمنسّق الطلب نفسِه، أو null حين لا شيء. */
export function formatCurrencyTotals(totals: CurrencyTotal[], separator = " · "): string | null {
  if (totals.length === 0) return null;
  return totals.map((t) => formatOrderMoney(t.minor, t.currency)).join(separator);
}
