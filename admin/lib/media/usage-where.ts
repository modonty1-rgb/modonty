import type { Prisma } from "@prisma/client";

/**
 * Single source of truth for "is this Media row in use anywhere?".
 *
 * A Media is "used" if at least one of these relations points to it:
 *   - featuredArticles  → Article.featuredImageId
 *   - articleGallery    → ArticleMedia (the gallery inside an article)
 *   - logoClients       → Client.logoMediaId
 *   - heroImageClients  → Client.heroImageMediaId
 *
 * `articleGallery` was missing until 2026-07-13, and that was a data-loss bug, not a
 * cosmetic one: an image placed in a published article's gallery counted as UNUSED, the
 * dashboard offered it up as an orphan, and canDeleteMedia() allowed it to be deleted —
 * leaving a hole in a live article. Any NEW relation to Media must be added here too.
 *
 * Stats, the /media filter and the delete guard MUST all use these clauses so the count
 * the admin sees ("58 unused files") is the same set the filter returns and the same set
 * that is safe to delete.
 */
export const MEDIA_USED_WHERE: Prisma.MediaWhereInput = {
  OR: [
    { featuredArticles: { some: {} } },
    { articleGallery: { some: {} } },
    { logoClients: { some: {} } },
    { heroImageClients: { some: {} } },
  ],
};

export const MEDIA_UNUSED_WHERE: Prisma.MediaWhereInput = {
  AND: [
    { featuredArticles: { none: {} } },
    { articleGallery: { none: {} } },
    { logoClients: { none: {} } },
    { heroImageClients: { none: {} } },
  ],
};
