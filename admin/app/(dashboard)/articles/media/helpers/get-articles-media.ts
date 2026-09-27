import "server-only";

import { db } from "@/lib/db";
import { MEDIA_USED_WHERE } from "@/lib/media/usage-where";
import { listMedia } from "@/lib/media/list-media";
import { articlesMediaWhere, type ArticlesMediaQuery } from "./articles-media-where";

/**
 * One page of Articles › Media, shaped for the shared media grid: each card says what the file
 * is FOR an article (featured / in a gallery / not used by one), and «In use» is the same
 * clause as the Used filter so badge and filter agree.
 */
export async function getArticlesMedia(query: ArticlesMediaQuery & { sort?: string; page?: number }) {
  const result = await listMedia(articlesMediaWhere(query), { sort: query.sort, page: query.page });
  const ids = result.items.map((m) => m.id);

  const [usedRows, galleryRows] = ids.length
    ? await Promise.all([
        db.media.findMany({ where: { AND: [{ id: { in: ids } }, MEDIA_USED_WHERE] }, select: { id: true } }),
        db.media.findMany({ where: { AND: [{ id: { in: ids } }, { articleGallery: { some: {} } }] }, select: { id: true } }),
      ])
    : [[], []];
  const used = new Set(usedRows.map((r) => r.id));
  const inGallery = new Set(galleryRows.map((r) => r.id));

  const items = result.items.map((m) => ({
    ...m,
    client: m.client || undefined,
    isUsed: used.has(m.id),
    roleLabel: m._count.featuredArticles > 0 ? "Featured image" : inGallery.has(m.id) ? "Article gallery" : "Article image",
  }));

  return { ...result, items };
}
