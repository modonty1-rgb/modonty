/**
 * Article database query helpers
 * Used by API routes and Server Components
 */

import { cache } from 'react';
import { cacheTag, cacheLife } from 'next/cache';
import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import type { ArticleResponse, ArticleFilters, InteractionCounts } from "./types";
import { calculateTrendingScore, getTrendingTimeRange } from "@/lib/trending";

type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: {
    client: {
      select: {
        id: true;
        name: true;
        slug: true;
        logoMedia: {
          select: {
            url: true;
          };
        };
      };
    };
    author: {
      select: {
        id: true;
        name: true;
        slug: true;
        bio: true;
        image: true;
      };
    };
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
    _count: {
      select: {
        likes: true;
        dislikes: true;
        favorites: true;
        comments: true;
        views: true;
      };
    };
  };
}>;

async function getArticlesCached(filters: ArticleFilters = {}) {
  "use cache";
  cacheTag("articles");
  cacheLife("minutes");

  const {
    page = 1,
    limit = 20,
    category,
    client,
    featured,
    status = ArticleStatus.PUBLISHED,
  } = filters;

  const where: Prisma.ArticleWhereInput = {
    status,
    ...(featured !== undefined && { featured }),
    ...(category && {
      category: {
        slug: category,
      },
    }),
    ...(client && {
      client: {
        slug: client,
      },
    }),
    ...(status === ArticleStatus.PUBLISHED && {
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
    }),
  };

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoMedia: {
              select: {
                url: true,
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            bio: true,
            image: true,
          },
        },
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
        _count: {
          select: {
            likes: true,
            dislikes: true,
            favorites: true,
            comments: true,
            views: true,
          },
        },
      },
      orderBy: [
        { featured: "desc" },
        { datePublished: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.article.count({ where }),
  ]);

  return {
    articles: articles.map(mapArticleToResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export const getArticles = cache(async (filters: ArticleFilters = {}) => {
  return getArticlesCached(filters);
});

export const getArticleBySlug = cache(async (slug: string) => {
  const article = await db.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoMedia: {
            select: {
              url: true,
            },
          },
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          image: true,
        },
      },
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
      _count: {
        select: {
          likes: true,
          dislikes: true,
          favorites: true,
          comments: true,
          views: true,
        },
      },
    },
  });

  if (!article) {
    return null;
  }

  return mapArticleToResponse(article);
});

export async function getFeaturedArticles(limit: number = 10) {
  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      featured: true,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoMedia: {
            select: {
              url: true,
            },
          },
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          image: true,
        },
      },
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
      _count: {
        select: {
          likes: true,
          dislikes: true,
          favorites: true,
          comments: true,
          views: true,
        },
      },
    },
    orderBy: { datePublished: "desc" },
    take: limit,
  });

  return articles.map(mapArticleToResponse);
}

export async function getRecentArticles(limit: number = 10, excludeArticleId?: string) {
  "use cache";
  cacheTag("articles");
  cacheLife("minutes");
  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
      ...(excludeArticleId && { id: { not: excludeArticleId } }),
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoMedia: {
            select: {
              url: true,
            },
          },
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          image: true,
        },
      },
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
      _count: {
        select: {
          likes: true,
          dislikes: true,
          favorites: true,
          comments: true,
          views: true,
        },
      },
    },
    orderBy: { datePublished: "desc" },
    take: limit,
  });

  return articles.map(mapArticleToResponse);
}

/**
 * Get trending articles with time-weighted scoring
 * Cached for 1 hour
 */
export const getTrendingArticles = cache(async (limit: number = 10, days: number = 7) => {
  const timeRange = getTrendingTimeRange(days);

  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
      createdAt: { gte: timeRange },
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoMedia: {
            select: {
              url: true,
            },
          },
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          image: true,
        },
      },
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
      _count: {
        select: {
          likes: true,
          dislikes: true,
          favorites: true,
          comments: true,
          views: true,
        },
      },
    },
    take: 100, // Fetch more for scoring
  });

  // Calculate trending scores
  const articlesWithScores = articles.map((article) => {
    const trendingData = calculateTrendingScore(
      {
        views: article._count?.views || 0,
        likes: article._count?.likes || 0,
        comments: article._count?.comments || 0,
        favorites: article._count?.favorites || 0,
      },
      article.createdAt
    );

    return {
      article,
      trendingScore: trendingData.score,
    };
  });

  // Sort by trending score and take top N
  const topTrending = articlesWithScores
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit)
    .map((item) => mapArticleToResponse(item.article));

  return topTrending;
});

function mapArticleToResponse(article: ArticleWithRelations): ArticleResponse {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || undefined,
    content: article.content || undefined,
    image: article.featuredImage?.url,
    publishedAt: (article.datePublished || article.createdAt).toISOString(),
    author: {
      id: article.author.id,
      name: article.author.name || "Modonty",
      slug: article.author.slug || undefined,
      bio: article.author.bio || undefined,
      image: article.author.image || undefined,
    },
    client: {
      id: article.client.id,
      name: article.client.name,
      slug: article.client.slug,
      logo: article.client.logoMedia?.url || undefined,
    },
    category: article.category
      ? {
          id: article.category.id,
          name: article.category.name,
          slug: article.category.slug,
        }
      : undefined,
    featuredImage: article.featuredImage
      ? {
          url: article.featuredImage.url,
          altText: article.featuredImage.altText || undefined,
        }
      : undefined,
    interactions: {
      likes: article._count?.likes || 0,
      dislikes: article._count?.dislikes || 0,
      comments: article._count?.comments || 0,
      favorites: article._count?.favorites || 0,
      views: article._count?.views || 0,
    },
    readingTimeMinutes: article.readingTimeMinutes || undefined,
    wordCount: article.wordCount || undefined,
  };
}
