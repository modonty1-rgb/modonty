import "server-only";

import { cache } from "react";
import { db } from "@/lib/db";
import type { MediaLinks } from "./usage-where";

type Oid = { $oid: string };
type Sets = Record<string, Array<Oid | null>>;

/**
 * The distinct media ids each pointer field holds, collected inside MongoDB: one `$group`
 * per table returns a single row of id lists — the files something points at, not one row
 * per article. `$addToSet` skips missing fields; nulls are dropped below.
 */
async function pointers(run: (pipeline: object[]) => Promise<unknown>, fields: string[]): Promise<Record<string, Set<string>>> {
  const group = Object.fromEntries(fields.map((f) => [f, { $addToSet: `$${f}` }]));
  const [row] = ((await run([{ $group: { _id: null, ...group } }])) as Sets[]) ?? [];
  return Object.fromEntries(
    fields.map((f) => [f, new Set((row?.[f] ?? []).flatMap((v) => (v && typeof v === "object" && "$oid" in v ? [v.$oid] : [])))]),
  );
}

/**
 * Every usage relation of `MEDIA_USAGE_RELATIONS`, read from the pointer side — nine small
 * aggregations in parallel, once per request (`cache`), instead of a `$lookup` for every
 * media row in every query. The page's own queries then filter with `id in [...]`.
 */
export const getMediaLinks = cache(async (): Promise<MediaLinks> => {
  const [article, gallery, client, author, category, tag, industry, modonty, sector] = await Promise.all([
    pointers((pipeline) => db.article.aggregateRaw({ pipeline }), ["featuredImageId"]),
    pointers((pipeline) => db.articleMedia.aggregateRaw({ pipeline }), ["mediaId"]),
    pointers((pipeline) => db.client.aggregateRaw({ pipeline }), ["logoMediaId", "heroImageMediaId", "mobileHeroImageMediaId", "introVideoMediaId"]),
    pointers((pipeline) => db.author.aggregateRaw({ pipeline }), ["imageMediaId", "socialImageMediaId"]),
    pointers((pipeline) => db.category.aggregateRaw({ pipeline }), ["socialImageMediaId"]),
    pointers((pipeline) => db.tag.aggregateRaw({ pipeline }), ["socialImageMediaId"]),
    pointers((pipeline) => db.industry.aggregateRaw({ pipeline }), ["socialImageMediaId"]),
    pointers((pipeline) => db.modonty.aggregateRaw({ pipeline }), ["heroImageMediaId", "socialImageMediaId"]),
    pointers((pipeline) => db.sectorPage.aggregateRaw({ pipeline }), ["heroMediaId", "heroMobileMediaId"]),
  ]);

  return {
    featuredArticles: article.featuredImageId,
    articleGallery: gallery.mediaId,
    logoClients: client.logoMediaId,
    heroImageClients: client.heroImageMediaId,
    mobileHeroImageClients: client.mobileHeroImageMediaId,
    introVideoClients: client.introVideoMediaId,
    authorImages: author.imageMediaId,
    authorSocialImages: author.socialImageMediaId,
    categorySocialImages: category.socialImageMediaId,
    tagSocialImages: tag.socialImageMediaId,
    industrySocialImages: industry.socialImageMediaId,
    modontyHeroImages: modonty.heroImageMediaId,
    modontySocialImages: modonty.socialImageMediaId,
    sectorHeroImages: sector.heroMediaId,
    sectorHeroMobileImages: sector.heroMobileMediaId,
  };
});
