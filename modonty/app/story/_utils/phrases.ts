/**
 * Splits a word array into phrase chunks based on Arabic/Latin sentence terminators.
 * Shared between LogoSpotlight + Vision2030Spotlight (synchronized subtitle rendering).
 */
export interface Phrase {
  start: number;
  end: number;
  text: string;
}

const TERMINATORS = /[.؟!?،,:؛;]$|\.\.$|\.\.\.$/;

export function splitIntoPhrases(words: string[]): Phrase[] {
  if (!words.length) return [];
  const phrases: Phrase[] = [];
  let chunkStart = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (TERMINATORS.test(w) || i === words.length - 1) {
      phrases.push({
        start: chunkStart,
        end: i,
        text: words.slice(chunkStart, i + 1).join(" "),
      });
      chunkStart = i + 1;
    }
  }
  return phrases;
}
