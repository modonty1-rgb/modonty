import "server-only";

import { db } from "@/lib/db";
import { startOfThisMonth } from "@/lib/media/start-of-this-month";
import { ARTICLE_MEDIA_KINDS, type ArticleMediaKind } from "./article-media-kinds";
import type { ArticlesMediaQuery } from "./articles-media-where";
import type { ArticlesMediaUniverse } from "./get-articles-media-universe";

/**
 * The number on each filter, counted WITH the other filters that are on — a number is always
 * the number of cards that filter would show (the rule Clients › Media settled on).
 */
export async function getArticlesMediaCounts(
  { where, issueIds }: ArticlesMediaUniverse,
  active: Omit<ArticlesMediaQuery, "excludeIds" | "issueIds">,
  /** Whether the «Issues» filter is on. */
  issuesOn: boolean,
) {
  const { kind, used, ...base } = active;
  const rest = { ...base, issueIds: issuesOn ? issueIds : undefined };
  const count = (q: ArticlesMediaQuery) => db.media.count({ where: where(q) });

  const [kinds, all, usedN, unusedN, createdThisMonth, issuesN] = await Promise.all([
    Promise.all(ARTICLE_MEDIA_KINDS.map((k) => count({ ...rest, used, kind: k.value }))),
    count({ ...rest, used }),
    count({ ...rest, kind, used: true }),
    count({ ...rest, kind, used: false }),
    db.media.count({ where: { AND: [where({ clientId: rest.clientId, articleId: rest.articleId }), { createdAt: { gte: startOfThisMonth() } }] } }),
    count({ ...base, kind, used, issueIds }),
  ]);

  const byKind = Object.fromEntries(ARTICLE_MEDIA_KINDS.map((k, i) => [k.value, kinds[i]])) as Record<ArticleMediaKind, number>;
  return { all, used: usedN, unused: unusedN, createdThisMonth, byKind, issues: issuesN };
}
