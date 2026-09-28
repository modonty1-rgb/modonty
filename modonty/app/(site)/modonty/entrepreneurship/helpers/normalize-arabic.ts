/**
 * Arabic text reduced to what a search should compare: no diacritics or tatweel, one alef, one yaa,
 * taa marbuta as haa. The ministry writes «الكترونيات» in one row and «الإلكترونية» in another;
 * without this a reader typing either finds half of them.
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
