import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import type { FeedPost } from "@/lib/types";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";

/** شكل الاستعلام والمحوّل لتغذية الصفحة الرئيسية — لا يقرأهما غير ملفَّي الرئيسية. */
export const homeFeedSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  datePublished: true,
  createdAt: true,
  featured: true,
  readingTimeMinutes: true,
  client: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
    },
  },
  category: { select: { id: true, name: true, slug: true } },
  featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true } },
  audioUrl: true,
  likesCount: true,
  commentsCount: true,
  favoritesCount: true,
  viewsCount: true,
} satisfies Prisma.ArticleSelect;

type HomeFeedPayload = Prisma.ArticleGetPayload<{ select: typeof homeFeedSelect }>;

/**
 * `coreClientId` is passed in, not read here: the mapper stays pure and the settings row is
 * read ONCE per query instead of once per row. Pass `null` where the distinction is
 * meaningless (a page that is already all-modonty, e.g. `/modonty`).
 */
export function mapHomeFeedArticle(a: HomeFeedPayload, coreClientId: string | null = null): FeedPost {
  return {
    isCore: coreClientId !== null && a.client.id === coreClientId,
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

export async function getHomeFeedArticlesCached(): Promise<FeedPost[]> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours"); // safe: admin revalidateTag("articles") fires on every publish/update/delete

  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: homeFeedSelect,
    orderBy: [
      { featured: "desc" as const },
      { datePublished: "desc" as const },
      { id: "desc" as const },
    ],
    take: FEED_PAGE_SIZE,
  });

  // One extra read per query, cached with the articles — every card downstream then knows
  // whether modonty wrote it, without the card asking the database.
  const coreClientId = await getCoreClientId();
  return articles.map((a) => mapHomeFeedArticle(a, coreClientId));
}
