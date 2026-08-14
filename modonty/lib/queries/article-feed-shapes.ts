import { cache } from 'react';
import { cacheTag, cacheLife } from 'next/cache';
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import type { ArticleResponse, ArticleFilters, InteractionCounts } from "@/lib/types";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";

export const feedArticleSelect = {
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
        select: { url: true, bunnyUrl: true, blurDataURL: true },
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
      url: true, bunnyUrl: true, blurDataURL: true,
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

export type FeedArticlePayload = Prisma.ArticleGetPayload<{ select: typeof feedArticleSelect }>;

export function mapFeedArticleToResponse(article: FeedArticlePayload): ArticleResponse {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || undefined,
    image: mediaSrc(article.featuredImage) ?? undefined,
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
      logo: mediaSrc(article.client.logoMedia) || undefined,
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
          url: mediaSrc(article.featuredImage) ?? article.featuredImage.url,
          bunnyUrl: null, // resolved into url above
          blurDataURL: article.featuredImage.blurDataURL,
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

export async function getArticlesCached(filters: ArticleFilters = {}) {
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
    hasAudio,
    status = ArticleStatus.PUBLISHED,
    sortBy = "newest",
  } = filters;

  // `id` is the final, unique tie-breaker — without it, rows sharing featured+datePublished
  // (notably the datePublished:null ties) reshuffle between requests, so offset pagination
  // (skip/take) overlaps page boundaries → the same article appears on two pages (duplicate key).
  const orderBy =
    sortBy === "oldest"
      ? [{ featured: "desc" as const }, { datePublished: "asc" as const }, { id: "asc" as const }]
      : sortBy === "title"
        ? [{ title: "asc" as const }, { id: "asc" as const }]
        : [{ featured: "desc" as const }, { datePublished: "desc" as const }, { id: "desc" as const }];

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
    ...(hasAudio && { audioUrl: { not: null } }),
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

// ── Homepage initial feed — leaner than the shared feed select ──────────────
// The feed card (PostCard) never renders author, dislikes, wordCount or industry.
// This dedicated query drops the author (User) join + those scalar/relation fields
// for the LCP-critical first render. Search/news/load-more keep the fuller select.
