/**
 * VAT per market, in basis points (1500 = 15%). One constant, read by the order snapshot
 * only — the catalog price is VAT-INCLUSIVE (PAY-Q7), so this is used to split a total into
 * subtotal + VAT for the tax invoice (PAY-Q14), never to add on top.
 */
export const SA_VAT_RATE_BP = 1500;

/**
 * مصر: **صفر** — قرار خالد ١٥ سبتمبر ٢٠٢٦.
 *
 * وليس سهواً ولا «قيمةً مؤقّتة»: المؤسّسة سعودية، وبيعُ خدمةٍ لمشترٍ في مصر لا يُحصَّل
 * عليه ضريبةٌ مصرية ما لم تكن المؤسّسة مسجَّلةً ضريبيّاً هناك — وليست كذلك. فسطرُ
 * «ضريبة ١٤٪» على فاتورةٍ مصرية يعني التزاماً معلَناً بمبلغٍ لا يُورَّد لمصلحة الضرائب
 * المصرية، وهو أسوأ من غياب السطر.
 *
 * وكانت الدالّة ترمي عند `EG` عمداً لأن النسبة لم تكن مقيسة (PAY-UNKNOWN #5). وظهر
 * أثرُ ذلك حيّاً حين فُتح مسار الشراء المصريّ (١٥ سبتمبر): `/eg/checkout` رجع **٥٠٠**
 * بـ`VAT rate for market "EG" is not configured`. فالرمي أدّى غرضه — منع تخمينٍ يُطبَع
 * على فاتورة — وانتهى بقرارٍ لا بتخمين.
 *
 * ⚠ ولو سُجّلت المؤسّسة ضريبيّاً في مصر يوماً، فالتغيير هنا وحده لا يكفي: أسعار كتالوج
 * مصر شاملةٌ للضريبة (PAY-Q7)، فرفعُ النسبة يقتطع من صافي السعر لا يضيف فوقه.
 */
export const EG_VAT_RATE_BP = 0;

export function vatRateBpForMarket(market: string): number {
  if (market === "SA") return SA_VAT_RATE_BP;
  if (market === "EG") return EG_VAT_RATE_BP;
  throw new Error(`VAT rate for market "${market}" is not configured`);
}
