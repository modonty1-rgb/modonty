import { stripTashkeel } from "./strip-tashkeel";

const stripPunct = (s: string) =>
  s.replace(/[.,!?؟،؛:«»""—\-…()\[\]{}]/g, "");

/** A word as the phrase matcher sees it: no tashkeel, no punctuation. Applied to the text and the phrase alike. */
export const normalizeArabic = (s: string) => stripPunct(stripTashkeel(s));
