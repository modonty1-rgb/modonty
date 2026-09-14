import type { CatalogTerm } from "./get-market-catalog";

/**
 * أيّ مدّة تفتح عليها صفحة البيع، من عنوان الصفحة (PAY-G10).
 *
 * الاسم المعتمد `?months=` لا `?duration=`: الأوّل يقول وحدته، والثاني يترك السؤال مفتوحاً
 * (أيام؟ أشهر؟) — وهو أيضاً لفظ السكيما نفسها (`paidMonths`)، فلا يصير للمفهوم اسمان.
 * و`?duration=` يبقى مقبولاً كمرادف لأن روابط جبر سيو تستعمله، فرابطٌ منسوخٌ لا يسقط.
 *
 * البارامتر مدخلٌ من الخارج: قيمة غير صالحة تسقط بهدوء على المدّة الموصى بها (PAY-G8)
 * ولا ترفع خطأً — صفحة بيع لا تُعاقب زائراً على رابط مكسور.
 *
 * مشتركة لا محلّية: المعاينة في الأدمن و`/pay` في `PAY-C2` يجب أن تقرآ نفس الاسم بنفس
 * القواعد، وإلا كُتبت روابط الحملات مرّتين وانحرفت إحداهما.
 */

export const TERM_PARAM = "months";
/** مرادف موروث من روابط جبر سيو — يُقرأ ولا يُكتب. */
export const TERM_PARAM_ALIAS = "duration";

export interface TermParams {
  months?: string | string[];
  duration?: string | string[];
}

/** آخر قيمة حين يتكرّر البارامتر (`?months=3&months=12`) — سلوك المتصفّحات نفسه. */
function pick(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[value.length - 1] : value;
}

export function resolveTermFromParams(terms: CatalogTerm[], params: TermParams): CatalogTerm | null {
  const fallback = terms.find((term) => term.isRecommended) ?? terms[0] ?? null;
  const raw = pick(params[TERM_PARAM]) ?? pick(params[TERM_PARAM_ALIAS]);
  if (!raw) return fallback;

  const months = Number(raw);
  if (!Number.isInteger(months)) return fallback;
  return terms.find((term) => term.paidMonths === months) ?? fallback;
}
