const ar = new Intl.NumberFormat("ar-SA");

/**
 * تصريف المعدود مع عدده كما يُنطق — القاعدة واحدة لكل اسم، والأسماء تختلف:
 *   ١ → مفرد · ٢ → مثنّى · ٣–١٠ → جمع · ١١+ → مفرد منصوب (تمييز).
 *
 * وُجد هذا الملفّ بعد أن خرجت البطاقة مرّتين بعربية مكسورة: «٣ شهر خدمة» ثم «٤ مقال
 * شهرياً». الأولى عولجت بمصرّف خاصّ بالأشهر، والثانية أثبتت أن القاعدة أعمّ من الأشهر —
 * فنسخة ثالثة لاسم ثالث كانت ستكسر بنفس الطريقة.
 */
export interface CountedForms {
  /** شهر · مقال */
  one: string;
  /** شهران · مقالان */
  two: string;
  /** أشهر · مقالات — يُستعمل من ٣ إلى ١٠ */
  few: string;
  /** شهراً · مقالاً — التمييز المنصوب من ١١ فأكثر */
  many: string;
}

export function formatCounted(n: number, forms: CountedForms): string {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (n >= 3 && n <= 10) return `${ar.format(n)} ${forms.few}`;
  return `${ar.format(n)} ${forms.many}`;
}

export const MONTHS: CountedForms = { one: "شهر", two: "شهران", few: "أشهر", many: "شهراً" };
export const ARTICLES: CountedForms = { one: "مقال", two: "مقالان", few: "مقالات", many: "مقالاً" };

export function formatArticles(n: number): string {
  return formatCounted(n, ARTICLES);
}
