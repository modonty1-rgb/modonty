import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

/** One enabled client, with everything the section needs to judge them at a glance. */
export interface ClientSiteRow {
  id: string;
  name: string;
  articlesBaseUrl: string;
  hasKey: boolean;
  keySuspended: boolean;
  apiKeyLastUsedAt: Date | null;
  /** Articles written for their site, whatever the stage. */
  totalArticles: number;
  /** Of those, the ones actually live on their domain. */
  liveArticles: number;
  /** Live articles their site has never once fetched — a broken integration. */
  neverFetched: number;
}

/**
 * The clients this section is about: the ones whose «Client Site Publishing» switch is
 * ON. The client is the entry point, not the article, because the destination is a
 * property of the client — you decide who publishes on their own domain, and only then
 * does writing for them mean anything.
 *
 * A client with the switch on but no articles yet still belongs here: that is exactly
 * the state where someone needs to start writing.
 */
export async function getClientSiteRows(): Promise<ClientSiteRow[]> {
  const clients = await db.client.findMany({
    where: { canPublishToOwnSite: true },
    select: {
      id: true,
      name: true,
      articlesBaseUrl: true,
      apiKey: true,
      apiKeySuspended: true,
      apiKeyLastUsedAt: true,
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  if (clients.length === 0) return [];

  const clientIds = clients.map((c) => c.id);

  // Counted in two grouped queries instead of per-client loops — the row count is what
  // tells the admin where the work is, and it must not cost one query per client.
  const [totals, live] = await Promise.all([
    db.article.groupBy({
      by: ["clientId"],
      where: { clientId: { in: clientIds }, isClientSiteArticle: true },
      _count: { _all: true },
    }),
    db.article.findMany({
      where: {
        clientId: { in: clientIds },
        status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE,
      },
      select: { clientId: true, lastFetchedAt: true },
      take: 2000,
    }),
  ]);

  const totalBy = new Map(totals.map((t) => [t.clientId, t._count._all]));

  return clients.map((c) => {
    const liveRows = live.filter((a) => a.clientId === c.id);
    return {
      id: c.id,
      name: c.name,
      articlesBaseUrl: c.articlesBaseUrl ?? "",
      hasKey: Boolean(c.apiKey),
      keySuspended: c.apiKeySuspended,
      apiKeyLastUsedAt: c.apiKeyLastUsedAt,
      totalArticles: totalBy.get(c.id) ?? 0,
      liveArticles: liveRows.length,
      neverFetched: liveRows.filter((a) => a.lastFetchedAt === null).length,
    };
  });
}
