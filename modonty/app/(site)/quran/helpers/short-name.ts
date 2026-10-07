/** «سُورَةُ ٱلْكَهۡفِ» → «ٱلْكَهۡفِ». The word «سورة» on every chip is six characters of nothing. */
export const shortName = (name: string) => name.replace(/^\S+\s+/, "");
