/**
 * Reference-data segments — categories, tags, industries, authors.
 * Same contract as the client and article segments: one key per clickable card, and
 * the key owns everything the page needs, so the card and the list cannot disagree.
 *
 * These four models share one shape (name + slug + the standard SEO cache), which is
 * why one scorer and one table serve all of them.
 */

export type ReferenceKey = "categories" | "tags" | "industries" | "authors";

interface ReferenceSegment {
  title: string;
  description: string;
  /** Where an admin goes to fix a row. */
  editBase: string;
}

const SEGMENTS: Record<ReferenceKey, ReferenceSegment> = {
  categories: {
    title: "Categories",
    description: "Every category page Google indexes, with the SEO score of each.",
    editBase: "/categories",
  },
  tags: {
    title: "Tags",
    description: "Every tag page Google indexes, with the SEO score of each.",
    editBase: "/tags",
  },
  industries: {
    title: "Industries",
    description: "Every industry page Google indexes, with the SEO score of each.",
    editBase: "/industries",
  },
  authors: {
    title: "Authors",
    description: "Every author page Google indexes, with the SEO score of each.",
    editBase: "/authors",
  },
};

export function getReferenceSegment(key: string): (ReferenceSegment & { key: ReferenceKey }) | null {
  const s = SEGMENTS[key as ReferenceKey];
  return s ? { ...s, key: key as ReferenceKey } : null;
}
