/**
 * Client database query helpers
 * Used by API routes and Server Components
 */

import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus, CommentStatus } from "@prisma/client";
import type { ClientResponse } from "./types";

type ClientWithArticles = Prisma.ClientGetPayload<{
  include: {
    logoMedia: {
      select: {
        url: true;
      };
    };
    ogImageMedia: {
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
      ogImageMedia: {
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
          _count: {
            select: {
              views: true,
              comments: {
                where: {
                  status: CommentStatus.APPROVED,
                },
              },
              likes: true,
              dislikes: true,
              favorites: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return clients.map((client) => {
    const articles = client.articles || [];
    
    const viewsCount = articles.reduce((sum, article) => sum + (article._count?.views || 0), 0);
    const commentsCount = articles.reduce((sum, article) => sum + (article._count?.comments || 0), 0);
    const likesCount = articles.reduce((sum, article) => sum + (article._count?.likes || 0), 0);
    const dislikesCount = articles.reduce((sum, article) => sum + (article._count?.dislikes || 0), 0);
    const favoritesCount = articles.reduce((sum, article) => sum + (article._count?.favorites || 0), 0);

    return {
      id: client.id,
      name: client.name,
      slug: client.slug,
      legalName: client.legalName || undefined,
      description: client.description || client.seoDescription || undefined,
      industry: client.industry || undefined,
      url: client.url || undefined,
      logo: client.logoMedia?.url || undefined,
      ogImage: client.ogImageMedia?.url || undefined,
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
      ogImageMedia: {
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
    ogImage: client.ogImageMedia?.url || undefined,
    email: client.email || undefined,
    phone: client.phone || undefined,
    seoTitle: client.seoTitle || undefined,
    seoDescription: client.seoDescription || undefined,
    articleCount: client._count?.articles || 0,
    articles: client.articles || [],
  };
}
