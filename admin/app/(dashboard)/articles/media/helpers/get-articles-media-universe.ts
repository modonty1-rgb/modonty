import "server-only";

import { db } from "@/lib/db";
import { getMediaLinks } from "@/lib/media/media-links";
import { findIssueMediaIds } from "@/lib/media/find-issue-media-ids";
import { articlesMediaWhere, type ArticlesMediaQuery } from "./articles-media-where";

/**
 * What every query on Articles › Media needs first, read once per request: the files each
 * pointer field holds (so no filter runs a `$lookup` per row), the triangle files, and — when
 * an article is picked — its featured image and gallery. The grid, the counts and the pickers
 * then each run their own query in the database.
 *
 * Before (28 Sep 2026): ~15 queries with relation filters, 7.6 s of server time.
 */
export async function getArticlesMediaUniverse(articleId: string | undefined) {
  const [links, issueIds, articleFiles] = await Promise.all([
    getMediaLinks(),
    findIssueMediaIds(),
    articleId
      ? Promise.all([
          db.article.findUnique({ where: { id: articleId }, select: { featuredImageId: true } }),
          db.articleMedia.findMany({ where: { articleId }, select: { mediaId: true } }),
        ]).then(([a, gallery]) => [...(a?.featuredImageId ? [a.featuredImageId] : []), ...gallery.map((g) => g.mediaId)])
      : null,
  ]);
  return {
    links,
    issueIds,
    where: (query: ArticlesMediaQuery) => articlesMediaWhere(links, articleFiles, query),
  };
}

export type ArticlesMediaUniverse = Awaited<ReturnType<typeof getArticlesMediaUniverse>>;
