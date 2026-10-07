import type { Paper } from "./types";

const decode = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

const tag = (block: string, name: string) => block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "";

/** A paper as the feed gives it, with its abstract — translated by the caller, not kept. */
type FeedPaper = Omit<Paper, "brief"> & { summary: string };

/**
 * The papers in an arXiv API answer (Atom), each with its abstract. A few fixed tags are read by
 * pattern rather than pulling in an XML parser for them. Titles arrive wrapped across lines — folded
 * back into one.
 */
export function parseArxivFeed(xml: string): FeedPaper[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => {
    const url = tag(e, "id").trim();
    return {
      id: url.replace(/^https?:\/\/arxiv\.org\/abs\//, ""),
      title: decode(tag(e, "title").replace(/\s+/g, " ").trim()),
      published: tag(e, "published").trim(),
      authors: [...e.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map(([, n]) => decode(n.trim())),
      url: url.replace(/^http:/, "https:"),
      summary: decode(tag(e, "summary").replace(/\s+/g, " ").trim()),
    };
  });
}
