/** One CSV cell as text: runs of whitespace folded to one space, ends trimmed, a missing cell as «». */
export const cleanText = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
