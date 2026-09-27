import "server-only";

import { db } from "@/lib/db";
import { ARTICLE_MEDIA_KINDS, type ArticleMediaKind } from "./article-media-kinds";
import { articlesMediaWhere, type ArticlesMediaQuery } from "./articles-media-where";

/**
 * The number on each filter, counted WITH the other filters that are on — a number is always
 * the number of cards that filter would show (the rule Clients › Media settled on).
 */
export async function getArticlesMediaCounts(
  active: Omit<ArticlesMediaQuery, "excludeIds" | "issueIds">,
  /** The universe's triangle files, and whether the «Issues» filter is on. */
  issues: { ids: string[]; on: boolean },
) {
  const { kind, used, ...base } = active;
  const rest = { ...base, issueIds: issues.on ? issues.ids : undefined };
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [kinds, all, usedN, unusedN, createdThisMonth, issuesN] = await Promise.all([
    Promise.all(ARTICLE_MEDIA_KINDS.map((k) => db.media.count({ where: articlesMediaWhere({ ...rest, used, kind: k.value }) }))),
    db.media.count({ where: articlesMediaWhere({ ...rest, used }) }),
    db.media.count({ where: articlesMediaWhere({ ...rest, kind, used: true }) }),
    db.media.count({ where: articlesMediaWhere({ ...rest, kind, used: false }) }),
    db.media.count({ where: { AND: [articlesMediaWhere({ clientId: rest.clientId, articleId: rest.articleId }), { createdAt: { gte: startOfMonth } }] } }),
    db.media.count({ where: articlesMediaWhere({ ...base, kind, used, issueIds: issues.ids }) }),
  ]);

  const byKind = Object.fromEntries(ARTICLE_MEDIA_KINDS.map((k, i) => [k.value, kinds[i]])) as Record<ArticleMediaKind, number>;
  return { all, used: usedN, unused: unusedN, createdThisMonth, byKind, issues: issuesN };
}
