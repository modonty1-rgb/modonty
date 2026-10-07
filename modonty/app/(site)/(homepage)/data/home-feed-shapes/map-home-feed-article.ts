import { mediaSrc } from "@modonty/shared/lib/media-src";
import type { Prisma } from "@prisma/client";
import type { FeedPost } from "@/lib/types";
import type { homeFeedSelect } from "./home-feed-select";

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
    // The writer's excerpt is the preferred card preview. Older and imported articles may
    // have only a search description, however, so use it rather than render an empty slot.
    excerpt: a.excerpt ?? a.seoDescription ?? undefined,
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
