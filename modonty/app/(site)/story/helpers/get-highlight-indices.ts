import { normalizeArabic as norm } from "./normalize-arabic";

/** Which word positions belong to a highlighted phrase — the first exact match of each phrase. */
export function getHighlightIndices(raw: string | string[] | undefined, words: string[]) {
  const indices = new Set<number>();
  if (!raw) return indices;
  const phrases = Array.isArray(raw) ? raw : [raw];
  const normalizedWords = words.map(norm);
  for (const phrase of phrases) {
    const hl = norm(phrase).split(/\s+/).filter(Boolean);
    if (!hl.length || hl.length > normalizedWords.length) continue;
    for (let i = 0; i <= normalizedWords.length - hl.length; i++) {
      let match = true;
      for (let j = 0; j < hl.length; j++) {
        if (normalizedWords[i + j] !== hl[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        for (let j = 0; j < hl.length; j++) indices.add(i + j);
        break;
      }
    }
  }
  return indices;
}
