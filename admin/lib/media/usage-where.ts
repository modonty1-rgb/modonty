import type { Prisma } from "@prisma/client";

/**
 * Single source of truth for "is this Media row in use anywhere?".
 *
 * A Media is "used" if at least one of these relations points to it:
 *   - featuredArticles  → Article.featuredImageId
 *   - logoClients       → Client.logoMediaId
 *   - heroImageClients  → Client.heroImageMediaId
 *
 * Both stats and the /media filter MUST use these clauses so the count
 * the admin sees (e.g. "58 unused files") matches what the filter returns.
 */
export const MEDIA_USED_WHERE: Prisma.MediaWhereInput = {
  OR: [
    { featuredArticles: { some: {} } },
    { logoClients: { some: {} } },
    { heroImageClients: { some: {} } },
  ],
};

export const MEDIA_UNUSED_WHERE: Prisma.MediaWhereInput = {
  AND: [
    { featuredArticles: { none: {} } },
    { logoClients: { none: {} } },
    { heroImageClients: { none: {} } },
  ],
};
