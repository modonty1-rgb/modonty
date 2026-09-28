import "server-only";

import { isMediaUsed } from "@/lib/media/usage-where";
import { listMedia } from "@/lib/media/list-media";
import type { ArticlesMediaQuery } from "./articles-media-where";
import type { ArticlesMediaUniverse } from "./get-articles-media-universe";

/**
 * One page of Articles › Media, shaped for the shared media grid: each card says what the file
 * is FOR an article (featured / in a gallery / not used by one), and «In use» is the same
 * rule as the Used filter so badge and filter agree.
 */
export async function getArticlesMedia(
  { links, where }: ArticlesMediaUniverse,
  query: ArticlesMediaQuery & { sort?: string; page?: number },
) {
  const result = await listMedia(where(query), { sort: query.sort, page: query.page });

  const items = result.items.map((m) => ({
    ...m,
    client: m.client || undefined,
    isUsed: isMediaUsed(m, links),
    roleLabel: links.featuredArticles.has(m.id) ? "Featured image" : links.articleGallery.has(m.id) ? "Article gallery" : "Article image",
  }));

  return { ...result, items };
}
