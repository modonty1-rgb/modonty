/**
 * Answers one question: «are these two buttons the same button?».
 *
 * Arabic hides duplicates that a strict comparison would wave through — «تسوق الآن»
 * and «تسوّق الآن» are different strings that render almost identically, and an admin
 * scanning a dropdown would see the same button twice with no idea why. So the check
 * runs on text with the differences that DON'T change the word removed: diacritics,
 * tatweel, the alef/yaa/taa-marbuta variants, and repeated spaces.
 *
 * The typed text is stored untouched — this is only the key we compare on.
 *
 * Lives outside the actions file on purpose: a `"use server"` module may only export
 * async functions, and this one is a pure synchronous helper.
 */
export function normalizeArabicLabel(input: string): string {
  return input
    .normalize("NFC")
    .replace(/[ً-ْٰـ]/g, "") // tashkeel, superscript alef, tatweel
    .replace(/[أإآٱ]/g, "ا") // أ إ آ ٱ → ا
    .replace(/ى/g, "ي") // ى → ي
    .replace(/ة/g, "ه") // ة → ه
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
