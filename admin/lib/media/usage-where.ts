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
 * Stats and the media page filters MUST all use these clauses so the count
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
  // Sector page heroes (27 Sep 2026) — /modonty/<sector>.
  "sectorHeroImages",
  "sectorHeroMobileImages",
  "modontySocialImages",
  "introVideoClients",
] as const;

/**
 * The three platform defaults (Settings › Defaults) — the logo, article image and cover a
 * client shows while it has none of its own. Found by their stable filename, never by a
 * relation (defaults-actions.ts), so nothing above saw them: Modonty › Media listed all three
 * as «Unused» with a live delete button (27 Sep 2026).
 */
export const PLATFORM_DEFAULT_PREFIX = "platform-default-";

// Types owned by a client and consumed purely by clientId + type (no back-relation).
const CLIENT_TYPE_USED: MediaType[] = [MediaType.GALLERY, MediaType.CLIENT_MINI];

/**
 * Every back-relation that makes a file «used». `media-links.ts` reads each one from its
 * pointer field; its `Record` type fails to compile when a relation is added here and not there.
 */
export const MEDIA_USAGE_RELATIONS = [
  "featuredArticles",
  "articleGallery",
  "logoClients",
  "heroImageClients",
  "mobileHeroImageClients",
  ...SITE_LINKS,
] as const;

export type MediaUsageRelation = (typeof MEDIA_USAGE_RELATIONS)[number];

/** Per relation: the ids of the files something points at (see `getMediaLinks`). */
export type MediaLinks = Record<MediaUsageRelation, Set<string>>;

/**
 * Why every clause below takes `links` instead of `{ relation: { some: {} } }`: on MongoDB
 * Prisma runs each relation filter as a `$lookup` for EVERY media row. One count with the
 * full «used» clause took 3.8 s against 73 ms without it (modonty_dev, 28 Sep 2026), an
 * index on the pointer only brought one relation from 810 to 233 ms, and the cost grows
 * with the library. `id in [the files something points at]` is an `_id` index lookup.
 */
export function linkedWhere(links: MediaLinks, ...relations: MediaUsageRelation[]): Prisma.MediaWhereInput {
  return { id: { in: [...new Set(relations.flatMap((k) => [...links[k]]))] } };
}

/** The exact complement of `linkedWhere` — `{ relation: { none: {} } }` for each. */
export function notLinkedWhere(links: MediaLinks, ...relations: MediaUsageRelation[]): Prisma.MediaWhereInput {
  return { id: { notIn: [...new Set(relations.flatMap((k) => [...links[k]]))] } };
}

/** A file on one of Modonty's own pages (author, category, tag, industry, a site page). */
export function mediaSiteUsedWhere(links: MediaLinks): Prisma.MediaWhereInput {
  return linkedWhere(links, ...SITE_LINKS);
}

export function mediaUsedWhere(links: MediaLinks): Prisma.MediaWhereInput {
  return {
    OR: [
      linkedWhere(links, ...MEDIA_USAGE_RELATIONS),
      { filename: { startsWith: PLATFORM_DEFAULT_PREFIX } },
      { AND: [{ clientId: { not: null } }, { type: { in: CLIENT_TYPE_USED } }] },
    ],
  };
}

export function mediaUnusedWhere(links: MediaLinks): Prisma.MediaWhereInput {
  return {
    AND: [
      notLinkedWhere(links, ...MEDIA_USAGE_RELATIONS),
      // filename is required, so NOT is safe here (no missing-field trap)
      { NOT: { filename: { startsWith: PLATFORM_DEFAULT_PREFIX } } },
      // negation of the client GALLERY/CLIENT_MINI used-clause (De Morgan)
      { OR: [{ clientId: null }, { type: { notIn: CLIENT_TYPE_USED } }] },
    ],
  };
}

/** `mediaUsedWhere` for a row already read — the «In use» badge on one page of cards. */
export function isMediaUsed(
  m: { id: string; filename: string; clientId: string | null; type: MediaType },
  links: MediaLinks,
): boolean {
  return (
    MEDIA_USAGE_RELATIONS.some((k) => links[k].has(m.id)) ||
    m.filename.startsWith(PLATFORM_DEFAULT_PREFIX) ||
    (m.clientId !== null && CLIENT_TYPE_USED.includes(m.type))
  );
}
