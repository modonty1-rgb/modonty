/**
 * The opening of a description, ready to translate: markdown, HTML, links and badges removed, cut at
 * a sentence end within `max` characters. What gets translated is what a reader needs — the first
 * sentence or two — not a whole model card.
 */
/**
 * A row of links is not a description — the top of a model card is often «🤖 ModelScope | 🤗 Hugging
 * Face | 📑 Blog | 🖥️ Demo…», which translated into a line of names (measured 28 Sep 2026).
 */
const isLinkRow = (p: string) => (p.match(/\]\(|<a\s|https?:\/\//g) ?? []).length >= 3;

export function leadText(raw: string, max = 240): string {
  const text = raw
    .replace(/^---[\s\S]*?\n---\s*/, "") // YAML front matter of a model card
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\n\s*\n/) // paragraphs
    .filter((p) => !isLinkRow(p))
    .map((p) =>
      p
        .replace(/<[^>]+>/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images and badges
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"), // links keep their words
    )
    .map((p) =>
      p
        .replace(/^#+\s.*$/gm, "") // headings
        .replace(/^\s*(?:[-*+>]|\d+\.)\s+/gm, "") // list and quote markers — hyphens inside words stay
        .replace(/[*_`|]+/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    // A sentence, not a heading or a list of names: at least six words of three letters or more.
    .find((p) => p.length >= 40 && (p.match(/\p{L}{3,}/gu) ?? []).length >= 6 && !/^(license|model card|citation|table of contents)/i.test(p)) ?? "";

  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("。"));
  return end > 60 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
