/**
 * Arabic formatting for every mobile endpoint.
 *
 * It lives on the SERVER on purpose. Hermes ships a partial `Intl`, so the phone cannot be
 * trusted to produce Arabic-Indic digits or the Gregorian month names the approved screens
 * show. Formatting here also keeps the rule «صفر نص عربي مكتوب داخل شاشة» honest: the app
 * renders strings, it never builds them.
 *
 * Calendar is pinned to `gregory`: `ar-SA` may resolve to the Islamic calendar depending on
 * the ICU build, and the approved screens read «١١ يونيو ٢٠٢٦».
 */

const LOCALE = "ar-SA";

const numberFormat = new Intl.NumberFormat(LOCALE);
const longDateFormat = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long", year: "numeric", calendar: "gregory" });
const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** «٨٧٧» — Arabic-Indic digits, matching every count in the approved screens. */
export function arabicNumber(value: number): string {
  return numberFormat.format(value);
}

/** «١١ يونيو ٢٠٢٦» */
export function arabicLongDate(value: Date): string {
  return longDateFormat.format(value);
}

/** «اليوم» · «أمس» · «قبل ساعتين» — the coarsest unit that still says something true. */
export function arabicRelativeTime(value: Date, now: Date = new Date()): string {
  const elapsed = now.getTime() - value.getTime();
  if (elapsed < HOUR_MS) return relativeFormat.format(-Math.max(1, Math.floor(elapsed / MINUTE_MS)), "minute");
  if (elapsed < DAY_MS) return relativeFormat.format(-Math.floor(elapsed / HOUR_MS), "hour");
  const days = Math.floor(elapsed / DAY_MS);
  if (days < 30) return relativeFormat.format(-days, "day");
  const months = Math.floor(days / 30);
  if (months < 12) return relativeFormat.format(-months, "month");
  return arabicLongDate(value);
}

/** Calendar-day bucket, so «اليوم» keeps meaning today and not «قبل ٢٣ ساعة». */
export function arabicDayLabel(value: Date, now: Date = new Date()): string {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayDelta = Math.round((new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime() - startOfToday) / DAY_MS);
  if (dayDelta > -7) return relativeFormat.format(dayDelta, "day");
  return arabicLongDate(value);
}

/**
 * عدّ عربيّ صحيح. **مرّر اسماً مفرداً لا جملة** — الصيغ تُركَّب حوله.
 *
 * العربية لا تسبق المفرد ولا المثنّى برقم: تقول «سؤال واحد» و«سؤالان»، لا «١ سؤال»
 * و«٢ سؤالان». وكانت الدالّة تفعل ذلك حرفياً، فظهر «١ متبقٍ» و«١ استشهاد» في الواجهة.
 * والدليل على أنّ العطل معروف: `articles/route.ts` كتب استثناءه بيده
 * (`decisionCount === 1 ? "مقال واحد يحتاج قرارك"`) بدل إصلاح المصدر — فبقيت خمسة
 * مواضع أخرى تنطق خطأً.
 *
 * ⚠️ **حدّ معلوم:** من ١١ فما فوق تقتضي العربية المفرد المنصوب («١١ سؤالاً») لا الجمع.
 * الدالّة تُخرج «١١ أسئلة». إصلاحه يحتاج صيغة خامسة عند كل مناداة، ولم يُطلب بعد؛
 * والحالة نادرة عملياً (أسئلة المقال ٣–٨، والاستشهادات ٢–١٠).
 */
export function arabicCount(count: number, one: string, two: string, many: string): string {
  if (count === 1) return `${one} واحد`;
  if (count === 2) return two;
  return `${arabicNumber(count)} ${many}`;
}

/**
 * «28 أغسطس 2026» — Arabic month name, LATIN digits.
 *
 * The S04 sheet mixes the two on purpose: dates, day counts and usage counters are
 * Latin («420 يوماً» · «8 من 8» · «28 أغسطس 2026») while only money is Arabic-Indic
 * («٢٬٤٠٠ ر.س»). So S04 cannot use `arabicLongDate`, which renders «٢٨ أغسطس ٢٠٢٦».
 * If Khalid settles on one numbering system for the whole app, delete this and
 * point the subscription rows back at `arabicLongDate`.
 */
const longDateLatinFormat = new Intl.DateTimeFormat("ar-SA-u-nu-latn", { day: "numeric", month: "long", year: "numeric", calendar: "gregory" });

export function arabicLongDateLatin(value: Date): string {
  return longDateLatinFormat.format(value);
}

/** «٢٬٤٠٠ ر.س» — money stays Arabic-Indic in every approved screen. */
const currencyFormats = {
  SAR: new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }),
  EGP: new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }),
} as const;

export function arabicCurrency(amount: number, currency: keyof typeof currencyFormats): string {
  return currencyFormats[currency].format(amount);
}

/** Joins the parts of a meta line with the separator the approved screens use. */
export function arabicMetaLine(parts: (string | null)[]): string | null {
  const present = parts.filter((part): part is string => part !== null && part.length > 0);
  return present.length === 0 ? null : present.join(" · ");
}
