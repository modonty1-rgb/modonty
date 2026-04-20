/**
 * Client database query helpers
 * Used by API routes and Server Components
 */

import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import type { ClientResponse } from "@/lib/types";

type ClientWithArticles = Prisma.ClientGetPayload<{
  include: {
    logoMedia: {
      select: {
        url: true;
      };
    };
    heroImageMedia: {
      select: {
        url: true;
      };
    };
    articles: {
      include: {
        category: {
          select: {
            id: true;
            name: true;
            slug: true;
          };
        };
        featuredImage: {
          select: {
            url: true;
            altText: true;
          };
        };
      };
    };
    _count: {
      select: {
        articles: true;
      };
    };
  };
}>;

export async function getClientsWithCounts(): Promise<ClientResponse[]> {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");
  const clients = await db.client.findMany({
    include: {
      logoMedia: {
        select: {
          url: true,
        },
      },
      heroImageMedia: {
        select: {
          url: true,
        },
      },
      industry: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
              datePublished: { lte: new Date() },
            },
          },
          subscribers: true,
        },
      },
      articles: {
        where: {
          status: ArticleStatus.PUBLISHED,
          datePublished: { lte: new Date() },
        },
        select: {
          viewsCount: true,
          commentsCount: true,
          likesCount: true,
          dislikesCount: true,
          favoritesCount: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return clients.map((client) => {
    const articles = client.articles || [];

    const viewsCount = articles.reduce((sum, article) => sum + (article.viewsCount || 0), 0);
    const commentsCount = articles.reduce((sum, article) => sum + (article.commentsCount || 0), 0);
    const likesCount = articles.reduce((sum, article) => sum + (article.likesCount || 0), 0);
    const dislikesCount = articles.reduce((sum, article) => sum + (article.dislikesCount || 0), 0);
    const favoritesCount = articles.reduce((sum, article) => sum + (article.favoritesCount || 0), 0);

    return {
      id: client.id,
      name: client.name,
      slug: client.slug,
      legalName: client.legalName || undefined,
      description: client.description || client.seoDescription || undefined,
      industry: client.industry || undefined,
      url: client.url || undefined,
      logo: client.logoMedia?.url || undefined,
      ogImage: client.heroImageMedia?.url || undefined,
      email: client.email || undefined,
      phone: client.phone || undefined,
      seoTitle: client.seoTitle || undefined,
      seoDescription: client.seoDescription || undefined,
      articleCount: client._count?.articles || 0,
      viewsCount,
      subscribersCount: client._count?.subscribers || 0,
      commentsCount,
      likesCount,
      dislikesCount,
      favoritesCount,
      subscriptionTier: client.subscriptionTier || undefined,
      createdAt: client.createdAt,
      isVerified: client.subscriptionTier === 'PRO' || client.subscriptionTier === 'PREMIUM',
    };
  });
}

export type ClientSortOption =
  | "name-asc"
  | "name-desc"
  | "articles-desc"
  | "articles-asc"
  | "newest"
  | "oldest";

function clientOrderBy(sortBy: ClientSortOption): Prisma.ClientOrderByWithRelationInput {
  switch (sortBy) {
    case "name-desc":
      return { name: "desc" };
    case "articles-desc":
      return { articles: { _count: "desc" } };
    case "articles-asc":
      return { articles: { _count: "asc" } };
    case "newest":
      return { createdAt: "desc" };
    case "oldest":
      return { createdAt: "asc" };
    default:
      return { name: "asc" };
  }
}

export async function getClientsSearch(
  search: string,
  limit = 10,
  sortBy: ClientSortOption = "name-asc"
): Promise<ClientResponse[]> {
  "use cache";
  cacheTag("clients");
  cacheLife("minutes");
  const trimmed = search.trim();
  if (!trimmed) return [];
  const orderBy = clientOrderBy(sortBy);
  const clients = await db.client.findMany({
    where: {
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { legalName: { contains: trimmed, mode: "insensitive" } },
        { description: { contains: trimmed, mode: "insensitive" } },
        { seoDescription: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    include: {
      logoMedia: { select: { url: true } },
      heroImageMedia: { select: { url: true } },
      industry: { select: { id: true, name: true, slug: true } },
      _count: {
        select: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
              datePublished: { lte: new Date() },
            },
          },
          subscribers: true,
        },
      },
      articles: {
        where: {
          status: ArticleStatus.PUBLISHED,
          datePublished: { lte: new Date() },
        },
        select: {
          viewsCount: true,
          commentsCount: true,
          likesCount: true,
          dislikesCount: true,
          favoritesCount: true,
        },
      },
    },
    orderBy,
    take: limit,
  });
  return clients.map((client) => {
    const articles = client.articles || [];
    const viewsCount = articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
    const commentsCount = articles.reduce((sum, a) => sum + (a.commentsCount || 0), 0);
    const likesCount = articles.reduce((sum, a) => sum + (a.likesCount || 0), 0);
    const dislikesCount = articles.reduce((sum, a) => sum + (a.dislikesCount || 0), 0);
    const favoritesCount = articles.reduce((sum, a) => sum + (a.favoritesCount || 0), 0);
    return {
      id: client.id,
      name: client.name,
      slug: client.slug,
      legalName: client.legalName || undefined,
      description: client.description || client.seoDescription || undefined,
      industry: client.industry || undefined,
      url: client.url || undefined,
      logo: client.logoMedia?.url || undefined,
      ogImage: client.heroImageMedia?.url || undefined,
      email: client.email || undefined,
      phone: client.phone || undefined,
      seoTitle: client.seoTitle || undefined,
      seoDescription: client.seoDescription || undefined,
      articleCount: client._count?.articles || 0,
      viewsCount,
      subscribersCount: client._count?.subscribers || 0,
      commentsCount,
      likesCount,
      dislikesCount,
      favoritesCount,
      subscriptionTier: client.subscriptionTier || undefined,
      createdAt: client.createdAt,
      isVerified: client.subscriptionTier === "PRO" || client.subscriptionTier === "PREMIUM",
    };
  });
}

export async function getClientPageStats() {
  const [totalClients, totalIndustries, totalArticles] = await Promise.all([
    db.client.count(),
    db.industry.count({ where: { clients: { some: {} } } }),
    db.article.count({ 
      where: { 
        status: ArticleStatus.PUBLISHED,
        client: { is: {} }
      } 
    }),
  ]);

  return { totalClients, totalIndustries, totalArticles };
}

export async function getClientBySlug(slug: string) {
  const client: ClientWithArticles | null = await db.client.findUnique({
    where: { slug },
    include: {
      logoMedia: {
        select: {
          url: true,
        },
      },
      heroImageMedia: {
        select: {
          url: true,
        },
      },
      articles: {
        where: {
          status: ArticleStatus.PUBLISHED,
          OR: [
            { datePublished: null },
            { datePublished: { lte: new Date() } },
          ],
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          featuredImage: {
            select: {
              url: true,
              altText: true,
            },
          },
        },
        orderBy: {
          datePublished: "desc",
        },
      },
      _count: {
        select: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
              datePublished: { lte: new Date() },
            },
          },
        },
      },
    },
  });

  if (!client) {
    return null;
  }

  return {
    id: client.id,
    name: client.name,
    slug: client.slug,
    legalName: client.legalName || undefined,
    url: client.url || undefined,
    logo: client.logoMedia?.url || undefined,
    ogImage: client.heroImageMedia?.url || undefined,
    email: client.email || undefined,
    phone: client.phone || undefined,
    seoTitle: client.seoTitle || undefined,
    seoDescription: client.seoDescription || undefined,
    articleCount: client._count?.articles || 0,
    articles: client.articles || [],
  };
}

export interface SidebarClient {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  industry?: string;
}

export async function getClientsForSidebar(limit = 20): Promise<SidebarClient[]> {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");

  const clients = await db.client.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      logoMedia: { select: { url: true } },
      industry:  { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return clients.map(c => ({
    id:       c.id,
    name:     c.name,
    slug:     c.slug,
    logo:     c.logoMedia?.url || undefined,
    industry: c.industry?.name || undefined,
  }));
}

