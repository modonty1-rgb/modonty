/**
 * Article database query helpers
 * Used by API routes and Server Components
 */

import { cache } from 'react';
import { cacheTag, cacheLife } from 'next/cache';
import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import type { ArticleResponse, ArticleFilters, InteractionCounts } from "@/lib/types";
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
        industry: {
          select: {
            name: true;
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
  };
}>;

// Feed-only select — excludes heavy fields (content, jsonLd, articleBodyText, metadata, etc.)
const feedArticleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  datePublished: true,
  createdAt: true,
  featured: true,
  readingTimeMinutes: true,
  wordCount: true,
  client: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoMedia: {
        select: { url: true },
      },
      industry: {
        select: { name: true },
      },
    },
  },
  author: {
    select: {
      id: true,
      name: true,
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
  audioUrl: true,
  likesCount: true,
  dislikesCount: true,
  favoritesCount: true,
  commentsCount: true,
  viewsCount: true,
} satisfies Prisma.ArticleSelect;

type FeedArticlePayload = Prisma.ArticleGetPayload<{ select: typeof feedArticleSelect }>;

function mapFeedArticleToResponse(article: FeedArticlePayload): ArticleResponse {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || undefined,
    image: article.featuredImage?.url,
    publishedAt: (article.datePublished || article.createdAt).toISOString(),
    author: {
      id: article.author.id,
      name: article.author.name || "Modonty",
      image: article.author.image || undefined,
    },
    client: {
      id: article.client.id,
      name: article.client.name,
      slug: article.client.slug,
      logo: article.client.logoMedia?.url || undefined,
      industry: article.client.industry?.name || undefined,
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
      likes: article.likesCount || 0,
      dislikes: article.dislikesCount || 0,
      comments: article.commentsCount || 0,
      favorites: article.favoritesCount || 0,
      views: article.viewsCount || 0,
    },
    readingTimeMinutes: article.readingTimeMinutes || undefined,
    wordCount: article.wordCount || undefined,
    hasAudio: !!article.audioUrl,
  };
}

async function getArticlesCached(filters: ArticleFilters = {}) {
  "use cache";
  cacheTag("articles");
  cacheLife("hours"); // safe: admin revalidateTag("articles") fires on every publish/update/delete

  const {
    page = 1,
    limit = 20,
    category,
    client,
    featured,
    search,
    status = ArticleStatus.PUBLISHED,
    sortBy = "newest",
  } = filters;

  const orderBy =
    sortBy === "oldest"
      ? [{ featured: "desc" as const }, { datePublished: "asc" as const }]
      : sortBy === "title"
        ? [{ title: "asc" as const }]
        : [{ featured: "desc" as const }, { datePublished: "desc" as const }];

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
    ...(search?.trim() && {
      AND: [
        {
          OR: [
            { title: { contains: search.trim(), mode: "insensitive" } },
            { excerpt: { contains: search.trim(), mode: "insensitive" } },
            { content: { contains: search.trim(), mode: "insensitive" } },
          ],
        },
      ],
    }),
  };

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      select: feedArticleSelect,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.article.count({ where }),
  ]);

  return {
    articles: articles.map(mapFeedArticleToResponse),
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
          industry: {
            select: { name: true },
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
    select: feedArticleSelect,
    orderBy: { datePublished: "desc" },
    take: limit,
  });

  return articles.map(mapFeedArticleToResponse);
}

export async function getRecentArticles(limit: number = 10, excludeArticleId?: string) {
  "use cache";
  cacheTag("articles");
  cacheLife("hours"); // safe: admin revalidateTag("articles") handles freshness
  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
      ...(excludeArticleId && { id: { not: excludeArticleId } }),
    },
    select: feedArticleSelect,
    orderBy: { datePublished: "desc" },
    take: limit,
  });

  return articles.map(mapFeedArticleToResponse);
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
    select: feedArticleSelect,
    take: 100, // Fetch more for scoring
  });

  // Calculate trending scores
  const articlesWithScores = articles.map((article) => {
    const trendingData = calculateTrendingScore(
      {
        views: article.viewsCount || 0,
        likes: article.likesCount || 0,
        comments: article.commentsCount || 0,
        favorites: article.favoritesCount || 0,
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
    .map((item) => mapFeedArticleToResponse(item.article));

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
      industry: article.client.industry?.name || undefined,
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
      likes: article.likesCount || 0,
      dislikes: article.dislikesCount || 0,
      comments: article.commentsCount || 0,
      favorites: article.favoritesCount || 0,
      views: article.viewsCount || 0,
    },
    readingTimeMinutes: article.readingTimeMinutes || undefined,
    wordCount: article.wordCount || undefined,
  };
}
