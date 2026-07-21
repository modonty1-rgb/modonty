import type { Prisma } from "@prisma/client";
import { MediaType } from "@prisma/client";

/**
 * Single source of truth for "is this Media row in use anywhere?".
 *
 * A Media is "used" if:
 *   - featuredArticles  → Article.featuredImageId
 *   - articleGallery    → ArticleMedia (the gallery inside an article)
 *   - logoClients       → Client.logoMediaId
 *   - heroImageClients  → Client.heroImageMediaId
 *   - it's a client-owned GALLERY / CLIENT_MINI image (clientId + type) — these are
 *     consumed by `client.media where type=…`, NOT via a back-relation.
 *
 * `articleGallery` was missing until 2026-07-13, and that was a data-loss bug, not a
 * cosmetic one: an image placed in a published article's gallery counted as UNUSED, the
 * dashboard offered it up as an orphan, and canDeleteMedia() allowed it to be deleted —
 * leaving a hole in a live article. The client GALLERY + CLIENT_MINI clause below was the
 * SAME bug (2026-07-21): the client page renders its gallery via
 * `db.media.findMany({ where: { clientId, type: "GALLERY" } })` (Organization.image[]),
 * and the article client card / sidebar slider read CLIENT_MINI the same way — neither has
 * a back-relation, so every such image showed as UNUSED and was deletable. Any NEW way a
 * Media is consumed (relation OR clientId+type) MUST be added here too.
 *
 * Stats, the /media filter and the delete guard MUST all use these clauses so the count
 * the admin sees ("58 unused files") is the same set the filter returns and the same set
 * that is safe to delete.
 */

// Types owned by a client and consumed purely by clientId + type (no back-relation).
const CLIENT_TYPE_USED = [MediaType.GALLERY, MediaType.CLIENT_MINI];

export const MEDIA_USED_WHERE: Prisma.MediaWhereInput = {
  OR: [
    { featuredArticles: { some: {} } },
    { articleGallery: { some: {} } },
    { logoClients: { some: {} } },
    { heroImageClients: { some: {} } },
    { AND: [{ clientId: { not: null } }, { type: { in: CLIENT_TYPE_USED } }] },
  ],
};

export const MEDIA_UNUSED_WHERE: Prisma.MediaWhereInput = {
  AND: [
    { featuredArticles: { none: {} } },
    { articleGallery: { none: {} } },
    { logoClients: { none: {} } },
    { heroImageClients: { none: {} } },
    // negation of the client GALLERY/CLIENT_MINI used-clause (De Morgan)
    { OR: [{ clientId: null }, { type: { notIn: CLIENT_TYPE_USED } }] },
  ],
};
