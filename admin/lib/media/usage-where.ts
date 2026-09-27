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
 *   - mobileHeroImageClients → Client.mobileHeroImageMediaId (the phone cover, 26 Sep 2026)
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

// Modonty's own pages and taxonomy use images too (27 Sep 2026): an industry's share image
// read «Unused» and the delete guard let it go, leaving the industry pointing at nothing
// (these relations are onDelete: NoAction). Measured on dev: 8 industry images.
const SITE_LINKS = [
  "authorImages",
  "authorSocialImages",
  "categorySocialImages",
  "tagSocialImages",
  "industrySocialImages",
  "modontyHeroImages",
  "modontySocialImages",
  "introVideoClients",
] as const;

/** A file on one of Modonty's own pages (author, category, tag, industry, a site page). */
export const MEDIA_SITE_USED_WHERE: Prisma.MediaWhereInput = {
  OR: SITE_LINKS.map((k) => ({ [k]: { some: {} } })),
};

/**
 * The three platform defaults (Settings › Defaults) — the logo, article image and cover a
 * client shows while it has none of its own. Found by their stable filename, never by a
 * relation (defaults-actions.ts), so nothing above saw them: Modonty › Media listed all three
 * as «Unused» with a live delete button (27 Sep 2026).
 */
export const PLATFORM_DEFAULT_PREFIX = "platform-default-";

// Types owned by a client and consumed purely by clientId + type (no back-relation).
const CLIENT_TYPE_USED = [MediaType.GALLERY, MediaType.CLIENT_MINI];

export const MEDIA_USED_WHERE: Prisma.MediaWhereInput = {
  OR: [
    { featuredArticles: { some: {} } },
    { articleGallery: { some: {} } },
    { logoClients: { some: {} } },
    { heroImageClients: { some: {} } },
    { mobileHeroImageClients: { some: {} } },
    ...SITE_LINKS.map((k) => ({ [k]: { some: {} } })),
    { filename: { startsWith: PLATFORM_DEFAULT_PREFIX } },
    { AND: [{ clientId: { not: null } }, { type: { in: CLIENT_TYPE_USED } }] },
  ],
};

export const MEDIA_UNUSED_WHERE: Prisma.MediaWhereInput = {
  AND: [
    { featuredArticles: { none: {} } },
    { articleGallery: { none: {} } },
    { logoClients: { none: {} } },
    { heroImageClients: { none: {} } },
    { mobileHeroImageClients: { none: {} } },
    ...SITE_LINKS.map((k) => ({ [k]: { none: {} } })),
    // filename is required, so NOT is safe here (no missing-field trap)
    { NOT: { filename: { startsWith: PLATFORM_DEFAULT_PREFIX } } },
    // negation of the client GALLERY/CLIENT_MINI used-clause (De Morgan)
    { OR: [{ clientId: null }, { type: { notIn: CLIENT_TYPE_USED } }] },
  ],
};
