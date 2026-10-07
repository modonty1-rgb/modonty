import { normalizeArabic as norm } from "./normalize-arabic";

export interface HighlightState {
  phrase: string;
  state: "past" | "present" | "future";
  startIdx: number;
}

/**
 * Every highlighted phrase with where it starts in the text and whether the reader has
 * passed it, is on it, or has yet to reach it — sorted by position, unmatched phrases last.
 */
export function getHighlightStates(allHighlights: string[], words: string[], activeWordIdx: number) {
  if (!allHighlights.length) return [] as HighlightState[];
  const normalizedWords = words.map(norm);
  const results: HighlightState[] = [];
  for (const phrase of allHighlights) {
    const hl = norm(phrase).split(/\s+/).filter(Boolean);
    let startIdx = -1;
    if (hl.length && hl.length <= normalizedWords.length) {
      for (let i = 0; i <= normalizedWords.length - hl.length; i++) {
        let match = true;
        for (let j = 0; j < hl.length; j++) {
          if (normalizedWords[i + j] !== hl[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          startIdx = i;
          break;
        }
      }
    }
    let state: "past" | "present" | "future" = "future";
    if (startIdx >= 0 && activeWordIdx >= 0) {
      if (activeWordIdx >= startIdx + hl.length) state = "past";
      else if (activeWordIdx >= startIdx) state = "present";
    }
    results.push({ phrase, state, startIdx });
  }
  results.sort((a, b) => {
    if (a.startIdx === -1 && b.startIdx === -1) return 0;
    if (a.startIdx === -1) return 1;
    if (b.startIdx === -1) return -1;
    return a.startIdx - b.startIdx;
  });
  return results;
}
