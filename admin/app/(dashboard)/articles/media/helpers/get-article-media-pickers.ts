import "server-only";

import { db } from "@/lib/db";
import type { ArticlesMediaQuery } from "./articles-media-where";
import type { ArticlesMediaUniverse } from "./get-articles-media-universe";

/**
 * The client and article pickers on Articles › Media, each option with how many files it has
 * under the type/usage/search filters that are on. Clients with files first; articles
 * newest-edited first, narrowed to the picked client.
 *
 * Per client: a `groupBy` inside the database. Per article: the article's featured image and
 * gallery (the picker lists every article anyway) against the ids of the matching files —
 * ids only, where the old read carried a `$lookup` of both relations for every file.
 */
export async function getArticleMediaPickers(
  { where }: ArticlesMediaUniverse,
  active: Pick<ArticlesMediaQuery, "clientId" | "kind" | "used" | "search" | "issueIds">,
) {
  const filters = { kind: active.kind, used: active.used, search: active.search, issueIds: active.issueIds };
  const [clients, articles, gallery, fileClients, matching] = await Promise.all([
    db.client.findMany({ select: { id: true, name: true } }),
    db.article.findMany({
      where: active.clientId ? { clientId: active.clientId } : {},
      select: { id: true, title: true, featuredImageId: true, client: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    // Every gallery row, not `article: { clientId }` — that is a relation filter again; rows of
    // other clients' articles find no entry in `filesOf` below and drop out.
    db.articleMedia.findMany({ select: { articleId: true, mediaId: true } }),
    db.media.groupBy({ by: ["clientId"], where: where(filters), _count: { _all: true } }),
    db.media.findMany({ where: where({ ...filters, clientId: active.clientId }), select: { id: true } }),
  ]);

  const perClient = new Map(fileClients.map((g) => [g.clientId, g._count._all]));

  const matched = new Set(matching.map((m) => m.id));
  const filesOf = new Map<string, Set<string>>();
  for (const a of articles) filesOf.set(a.id, new Set(a.featuredImageId ? [a.featuredImageId] : []));
  for (const g of gallery) filesOf.get(g.articleId)?.add(g.mediaId);
  const countOf = (articleId: string) => [...(filesOf.get(articleId) ?? [])].filter((id) => matched.has(id)).length;

  return {
    clients: clients
      .map((c) => ({ id: c.id, name: c.name.trim(), count: perClient.get(c.id) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    articles: articles.map((a) => ({
      id: a.id,
      name: a.title.trim() || "(untitled)",
      hint: a.client?.name,
      count: countOf(a.id),
    })),
  };
}
