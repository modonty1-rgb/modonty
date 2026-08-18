import { cacheTag, cacheLife } from "next/cache";
import { Prisma, ArticleStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import type { FeedPost } from "@/lib/types";

/** The three orders the visitor can pick. Anything else falls back to newest. */
export type ArchiveSort = "newest" | "mostRead" | "mostEngaged";

export interface ArchiveQuery {
  industrySlug?: string;
  categorySlug?: string;
  tagSlug?: string;
  sort?: ArchiveSort;
}

/**
 * One bounded read, sliced per page — the same shape `/clients` and `/industries` use. At 117
 * published articles a skip/take round-trip per page costs more than it saves, and the whole
 * result is cached under the `articles` tag anyway.
 */
const MAX_ARCHIVE_ARTICLES = 300;

const archiveSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  datePublished: true,
  createdAt: true,
  readingTimeMinutes: true,
  client: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
    },
  },
  featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true } },
  audioUrl: true,
  likesCount: true,
  commentsCount: true,
  favoritesCount: true,
  viewsCount: true,
} satisfies Prisma.ArticleSelect;

type ArchivePayload = Prisma.ArticleGetPayload<{ select: typeof archiveSelect }>;

function mapArchiveArticle(a: ArchivePayload): FeedPost {
  return {
    id: a.id,
    title: a.title,
    excerpt: a.excerpt ?? undefined,
    image: mediaSrc(a.featuredImage) ?? undefined,
    imageBlur: a.featuredImage?.blurDataURL ?? undefined,
    slug: a.slug,
    publishedAt: a.datePublished || a.createdAt,
    clientName: a.client.name,
    clientSlug: a.client.slug,
    clientId: a.client.id,
    clientLogo: mediaSrc(a.client.logoMedia) ?? undefined,
    readingTimeMinutes: a.readingTimeMinutes ?? undefined,
    hasAudio: !!a.audioUrl,
    likes: a.likesCount || 0,
    comments: a.commentsCount || 0,
    favorites: a.favoritesCount || 0,
    views: a.viewsCount || 0,
    status: "published",
  };
}

function orderFor(sort: ArchiveSort | undefined): Prisma.ArticleOrderByWithRelationInput[] {
  if (sort === "mostRead") return [{ viewsCount: "desc" }, { datePublished: "desc" }, { id: "desc" }];
  if (sort === "mostEngaged") return [{ likesCount: "desc" }, { commentsCount: "desc" }, { id: "desc" }];
  return [{ datePublished: "desc" }, { id: "desc" }];
}

/**
 * The archive itself: every published article, narrowed by whatever the visitor picked.
 *
 * The industry filter reaches through the partner (`client.industryId`) because an article has no
 * industry of its own — the business axis belongs to whoever wrote it. That indirection is exactly
 * why the industry↔category link is DERIVED and not stored: it is a fact about the articles, and
 * it changes every time one is published.
 */
export async function getArticlesArchive(query: ArchiveQuery = {}): Promise<FeedPost[]> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");

  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      ...(query.categorySlug && { category: { slug: query.categorySlug } }),
      ...(query.tagSlug && { tags: { some: { tag: { slug: query.tagSlug } } } }),
      ...(query.industrySlug && {
        client: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          industry: { slug: query.industrySlug },
        },
      }),
    },
    select: archiveSelect,
    orderBy: orderFor(query.sort),
    take: MAX_ARCHIVE_ARTICLES,
  });

  return articles.map(mapArchiveArticle);
}
