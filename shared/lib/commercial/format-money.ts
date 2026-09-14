/**
 * One money formatter for every selling surface (card, preview, order page).
 * Arabic digits and the market's own locale — an `en-GB` number inside an RTL card
 * reads backwards, which is why the invoice template already formats this way
 * (`admin/lib/email/templates/invoice.ts`).
 */
export function formatCatalogMoney(amount: number, currency: string, fractionDigits = 0): string {
  const locale = currency === "EGP" ? "ar-EG" : "ar-SA";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

/**
 * نفس المنسّق لمبلغ محفوظ بالوحدة الصغرى (هللة / قرش). موجود كي لا تتناثر القسمة على ١٠٠
 * في المكوّنات — وهي أكثر موضع تُرتكب فيه غلطة خانة عشرية في واجهات البيع.
 */
export function formatCatalogMoneyMinor(minor: number, currency: string, fractionDigits = 0): string {
  return formatCatalogMoney(minor / 100, currency, fractionDigits);
}

/**
 * رمز العملة العربيّ ورقمُها منفصلَين — لأن بطاقة البيع تكبّر الرقم وتصغّر الرمز، وهو ما
 * لا يفعله `Intl` بصيغته الموحّدة (يُخرجهما ككتلةٍ واحدة بحجمٍ واحد).
 *
 * مكانهما هنا لا في البطاقة (تدقيق ١٤ سبتمبر ٢٠٢٦): كانا مكتوبَين داخل `plan-card.tsx`،
 * فصار في المشروع موضعان يعرفان أن `EGP` تُكتب «ج.م» — وثالثٌ يوم تُضاف عملة. والقاعدة
 * تخزّن الرمز الدوليّ (`SAR`/`EGP`) وحده؛ وكيف يُكتب عربيّاً شأن العرض، فيبقى في الكود
 * لكن في **ملفّ واحد**.
 */
const CURRENCY_LABEL: Record<string, string> = { SAR: "ر.س", EGP: "ج.م" };

/** «ر.س» · «ج.م» — أو الرمز الدوليّ كما هو لعملةٍ لم تُترجَم بعد. */
export function currencyLabel(currency: string): string {
  return CURRENCY_LABEL[currency] ?? currency;
}

/** الرقم وحده بأرقام عربية، بلا رمز عملة — يُكتب الرمز بجانبه بحجمٍ أصغر. */
export function formatAmountMinor(minor: number, currency: string): string {
  return new Intl.NumberFormat(currency === "EGP" ? "ar-EG" : "ar-SA", { maximumFractionDigits: 0 }).format(minor / 100);
}
