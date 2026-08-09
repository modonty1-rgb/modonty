import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

/**
 * The client's own screen for the articles that live on THEIR website.
 *
 * Read only, deliberately: they approve an article once, in «المقالات», and after that
 * this page answers one question — «is it out, and where». Adding actions here would be
 * a second place to approve the same thing.
 */
export interface SiteArticleRow {
  id: string;
  title: string;
  url: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  isMain: boolean;
}

export interface SiteArticlesData {
  enabled: boolean;
  articlesBaseUrl: string | null;
  hasKey: boolean;
  keySuspended: boolean;
  /** Null until their website pulls for the first time — the tell that the link works. */
  lastFetchedAt: Date | null;
  articles: SiteArticleRow[];
}

export async function loadSiteArticles(clientId: string): Promise<SiteArticlesData> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      canPublishToOwnSite: true,
      articlesBaseUrl: true,
      apiKey: true,
      apiKeySuspended: true,
      apiKeyLastUsedAt: true,
    },
  });

  if (!client?.canPublishToOwnSite) {
    return {
      enabled: false,
      articlesBaseUrl: null,
      hasKey: false,
      keySuspended: false,
      lastFetchedAt: null,
      articles: [],
    };
  }

  const rows = await db.article.findMany({
    where: {
      clientId,
      isClientSiteArticle: true,
      status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE,
    },
    select: {
      id: true,
      title: true,
      canonicalUrl: true,
      mainEntityOfPage: true,
      datePublished: true,
      updatedAt: true,
      isMainArticle: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return {
    enabled: true,
    articlesBaseUrl: client.articlesBaseUrl,
    hasKey: Boolean(client.apiKey),
    keySuspended: client.apiKeySuspended,
    lastFetchedAt: client.apiKeyLastUsedAt,
    articles: rows.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.canonicalUrl ?? r.mainEntityOfPage,
      publishedAt: r.datePublished,
      updatedAt: r.updatedAt,
      isMain: r.isMainArticle,
    })),
  };
}

/** Whether the sidebar item should exist at all — no articles, no screen. */
export async function hasSiteArticles(clientId: string): Promise<boolean> {
  const count = await db.article.count({
    where: {
      clientId,
      isClientSiteArticle: true,
      status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE,
    },
  });
  return count > 0;
}
