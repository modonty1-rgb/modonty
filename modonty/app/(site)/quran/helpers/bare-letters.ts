// Matched against the bare letters: the stored names carry full diacritics and a leading
// «سُورَةُ», neither of which anybody types. The index travels with each match so the play
// handler keeps addressing the real position in the mushaf, not a position in the filtered view.
//
// The range has to reach past ordinary tashkeel into the Qur'anic marks: «الكَهۡفِ» carries a
// small high sukun (U+06E1) and «ٱلْفَاتِحَةِ» an alef wasla (U+0671), and neither is on anybody's
// keyboard. Stripping only U+064B–U+0652 left «الكهۡف», so typing «الكهف» matched nothing.
//
// «آلِ عِمۡرَانَ» needed one more: the madda is stored DECOMPOSED — alef U+0627 followed by
// U+0653 — while a keyboard produces the single character آ (U+0622). Normalising to NFC first
// folds the pair into that one character, and then the alef rule catches it.
export const bareLetters = (v: string) =>
  v
    .normalize("NFC")
    .replace(/[ً-ٰٕـٖ-ٟۖ-ۭ]/g, "")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
