export interface ArticleHeading {
  id: string;
  text: string;
  level: number;
}

export interface ArticleOutline {
  /** The body with a stable `id` on every heading, ready to render. */
  html: string;
  headings: ArticleHeading[];
  /** First sentence under each of the first three H2s — a summary, not a list of questions. */
  summary: string[];
}

const strip = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

/**
 * A heading's id comes from its own words, not its position.
 *
 * The table of contents used to inject `toc-0`, `toc-1`… from the browser after mount, which
 * made every anchor break the moment a section was added above it — and left nothing at all
 * in the HTML for a crawler or for a visitor whose JavaScript never arrived.
 */
function slugify(text: string, taken: Set<string>): string {
  const base =
    text
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "قسم";

  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  taken.add(id);
  return id;
}

/** First sentence of the first paragraph after `from`, or null if the section opens with a table or image. */
function firstSentenceAfter(html: string, from: number): string | null {
  const rest = html.slice(from);
  const nextHeading = rest.search(/<h[1-6][\s>]/i);
  const section = nextHeading === -1 ? rest : rest.slice(0, nextHeading);

  const paragraph = section.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const text = strip(paragraph?.[1] ?? "");
  if (text.length < 25) return null;

  // Arabic full stop is the plain dot; question marks end a sentence too.
  const end = text.search(/[.؟!]\s|[.؟!]$/);
  const sentence = end === -1 ? text : text.slice(0, end + 1);
  return sentence.length > 200 ? `${sentence.slice(0, 197).trimEnd()}…` : sentence;
}

/**
 * Reads the article body once and returns everything derived from its structure: the body with
 * heading ids, the outline for the table of contents, and the summary box's three lines.
 *
 * One pass, one source of truth — the ids in `html` are the same ids the outline links to.
 */
export function readArticleOutline(html: string): ArticleOutline {
  const headings: ArticleHeading[] = [];
  const taken = new Set<string>();

  const withIds = html.replace(
    /<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level: string, attrs: string, inner: string) => {
      const text = strip(inner);
      if (!text) return match;

      const existing = attrs.match(/\sid=["']([^"']+)["']/i);
      const id = existing ? existing[1] : slugify(text, taken);
      if (existing) taken.add(id);

      headings.push({ id, text, level: Number(level) });
      return existing
        ? match
        : `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    }
  );

  const summary: string[] = [];
  for (const heading of headings.filter((h) => h.level === 2).slice(0, 3)) {
    const at = withIds.indexOf(`id="${heading.id}"`);
    const sentence = at === -1 ? null : firstSentenceAfter(withIds, at);
    if (sentence) summary.push(sentence);
  }

  return { html: withIds, headings, summary };
}
