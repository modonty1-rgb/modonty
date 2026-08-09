import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

export interface ClientSiteArticleRow {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  isMainArticle: boolean;
  datePublished: Date | null;
  lastFetchedAt: Date | null;
  /** The address this article lives at on the client's own domain. */
  publicUrl: string | null;
}

export interface ClientSiteDetail {
  id: string;
  name: string;
  articlesBaseUrl: string;
  hasKey: boolean;
  keySuspended: boolean;
  apiKeyLastUsedAt: Date | null;
  articles: ClientSiteArticleRow[];
  /** Marking a main article needs a real cluster under it — four is the floor. */
  canMarkMain: boolean;
}

const MIN_ARTICLES_FOR_MAIN = 4;

/**
 * One client's workspace: their articles, and everything needed to judge and act on
 * them without leaving the page.
 *
 * Returns null when the client does not exist OR has publishing switched off — this
 * section only ever shows clients who belong in it, so a stale link cannot become a
 * back door into an unrelated client.
 */
export async function getClientSiteDetail(clientId: string): Promise<ClientSiteDetail | null> {
  const client = await db.client.findFirst({
    where: { id: clientId, canPublishToOwnSite: true },
    select: {
      id: true,
      name: true,
      articlesBaseUrl: true,
      apiKey: true,
      apiKeySuspended: true,
      apiKeyLastUsedAt: true,
    },
  });

  if (!client) return null;

  const articles = await db.article.findMany({
    where: { clientId, isClientSiteArticle: true },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isMainArticle: true,
      datePublished: true,
      lastFetchedAt: true,
    },
    orderBy: [{ isMainArticle: "desc" }, { datePublished: "desc" }, { updatedAt: "desc" }],
    take: 300,
  });

  const base = (client.articlesBaseUrl ?? "").replace(/\/+$/, "");

  return {
    id: client.id,
    name: client.name,
    articlesBaseUrl: client.articlesBaseUrl ?? "",
    hasKey: Boolean(client.apiKey),
    keySuspended: client.apiKeySuspended,
    apiKeyLastUsedAt: client.apiKeyLastUsedAt,
    canMarkMain: articles.length >= MIN_ARTICLES_FOR_MAIN,
    articles: articles.map((a) => ({
      ...a,
      publicUrl: base ? `${base}/${a.slug}` : null,
    })),
  };
}
