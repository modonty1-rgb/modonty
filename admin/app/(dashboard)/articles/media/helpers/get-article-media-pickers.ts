import "server-only";

import { db } from "@/lib/db";
import { articlesMediaWhere, type ArticlesMediaQuery } from "./articles-media-where";

/**
 * The two searchable pickers on Articles › Media, each row with how many article files it has
 * under the filters that are on:
 * - clients — every client, Modonty included (its articles are articles too);
 * - articles — of the picked client, or all of them; the client's name is the second line.
 * Both counts run the page's own filters (type, usage, search, Issues), so a row's number is
 * the number of cards picking it shows — the article counts ignored them until 27 Sep 2026.
 * Counted by tallying one column, not `groupBy` — Prisma's MongoDB groupBy panicked on this
 * filter shape (26 Sep 2026).
 */
export async function getArticleMediaPickers(
  active: Pick<ArticlesMediaQuery, "clientId" | "kind" | "used" | "search" | "issueIds">,
) {
  const filters = { kind: active.kind, used: active.used, search: active.search, issueIds: active.issueIds };
  const [clients, articles, fileClients, articleFiles] = await Promise.all([
    db.client.findMany({ select: { id: true, name: true } }),
    db.article.findMany({
      where: active.clientId ? { clientId: active.clientId } : {},
      select: { id: true, title: true, client: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    db.media.findMany({ where: articlesMediaWhere(filters), select: { clientId: true } }),
    db.media.findMany({
      where: articlesMediaWhere({ ...filters, clientId: active.clientId }),
      select: { featuredArticles: { select: { id: true } }, articleGallery: { select: { articleId: true } } },
    }),
  ]);

  const perClient = new Map<string, number>();
  for (const r of fileClients) if (r.clientId) perClient.set(r.clientId, (perClient.get(r.clientId) ?? 0) + 1);

  // One file counts once per article, even if it is both the featured image and in the gallery.
  const perArticle = new Map<string, number>();
  for (const f of articleFiles) {
    const ids = new Set([...f.featuredArticles.map((a) => a.id), ...f.articleGallery.map((g) => g.articleId)]);
    for (const id of ids) perArticle.set(id, (perArticle.get(id) ?? 0) + 1);
  }

  return {
    clients: clients
      .map((c) => ({ id: c.id, name: c.name.trim(), count: perClient.get(c.id) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    articles: articles.map((a) => ({
      id: a.id,
      name: a.title.trim() || "(untitled)",
      hint: a.client?.name,
      count: perArticle.get(a.id) ?? 0,
    })),
  };
}
