/**
 * Reference-data segments — categories, tags, industries, authors.
 * Same contract as the client and article segments: one key per clickable card, and
 * the key owns everything the page needs, so the card and the list cannot disagree.
 *
 * These four models share one shape (name + slug + the standard SEO cache), which is
 * why one scorer and one table serve all of them.
 */

type ReferenceKey = "categories" | "tags" | "industries" | "authors";

interface ReferenceSegment {
  title: string;
  description: string;
  /** Where an admin goes to fix a row. */
  editBase: string;
  /**
   * Authors have no per-id edit route — the admin manages ONE author (Modonty) on
   * /authors itself. Everything else edits at `{editBase}/{id}/edit`. Discovered the
   * hard way: the per-id pattern 404'd on authors (live test 2026-07-14).
   */
  editMode: "perId" | "single";
}

const SEGMENTS: Record<ReferenceKey, ReferenceSegment> = {
  categories: {
    title: "الفئات",
    description: "كل صفحة فئة يؤرشفها جوجل، ومعها درجة سيوها.",
    editBase: "/categories",
    editMode: "perId",
  },
  tags: {
    title: "الوسوم",
    description: "كل صفحة وسم يؤرشفها جوجل، ومعها درجة سيوها.",
    editBase: "/tags",
    editMode: "perId",
  },
  industries: {
    title: "الصناعات",
    description: "كل صفحة صناعة يؤرشفها جوجل، ومعها درجة سيوها.",
    editBase: "/industries",
    editMode: "perId",
  },
  authors: {
    title: "الكتّاب",
    description: "كل صفحة كاتب يؤرشفها جوجل، ومعها درجة سيوها.",
    editBase: "/authors",
    editMode: "single",
  },
};

export function getReferenceSegment(key: string): (ReferenceSegment & { key: ReferenceKey }) | null {
  const s = SEGMENTS[key as ReferenceKey];
  return s ? { ...s, key: key as ReferenceKey } : null;
}
