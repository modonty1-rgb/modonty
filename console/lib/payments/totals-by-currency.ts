export interface CurrencyTotal {
  currency: string;
  minor: number;
}

/**
 * مبلغٌ لكلّ عملةٍ وحدها — لا يُجمع ريالٌ على جنيه في رقمٍ واحد
 * (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد). العملةُ من الطلب أو الفاتورة، لا من عنوان العميل.
 * مرتَّبٌ بالعملة كـ`outstandingByCurrency`، فيثبت ترتيبُ «المدفوع» و«المستحقّ» في العرض.
 */
export function totalsByCurrency(rows: CurrencyTotal[]): CurrencyTotal[] {
  const byCurrency = new Map<string, number>();
  for (const r of rows) byCurrency.set(r.currency, (byCurrency.get(r.currency) ?? 0) + r.minor);
  return [...byCurrency]
    .map(([currency, minor]) => ({ currency, minor }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}
