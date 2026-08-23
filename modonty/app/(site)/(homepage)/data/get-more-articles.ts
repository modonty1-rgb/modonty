import "server-only";

import { getArticles } from "@/lib/queries/get-articles";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";

import type { ArticleResponse, FeedPost } from "@/lib/types";

export interface MoreArticlesResult {
  articles: FeedPost[];
  hasMore: boolean;
}

/**
 * One page of feed articles. Callers are the web action, and later the mobile
 * endpoint — so the shaping lives here and is never written twice.
 */
export async function getMoreArticles(
  page: number,
  categorySlug?: string,
  clientSlug?: string,
  /**
   * The feed view the reader is on. Added 22 Aug 2026: without it an infinite feed under a
   * filter had to stop after the first chunk, because a scrolled page would arrive in the
   * default order and silently undo the filter the reader had just chosen.
   */
  view?: "latest" | "popular" | "audio"
): Promise<MoreArticlesResult> {
  try {
    const { articles, pagination } = await getArticles({
      page,
      limit: FEED_PAGE_SIZE,
      ...(categorySlug && { category: categorySlug }),
      ...(clientSlug && { client: clientSlug }),
      ...(view === "audio" && { hasAudio: true }),
      ...(view === "popular" && { sortBy: "popular" as const }),
    });

    const posts: FeedPost[] = articles.map((article: ArticleResponse) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt ?? undefined,
      image: article.image,
      imageBlur: article.featuredImage?.blurDataURL ?? undefined,
      slug: article.slug,
      publishedAt: new Date(article.publishedAt),
      clientName: article.client.name,
      clientSlug: article.client.slug,
      clientLogo: article.client.logo,
      readingTimeMinutes: article.readingTimeMinutes,
      hasAudio: article.hasAudio,
      author: {
        id: article.author.id,
        name: article.author.name || "Modonty",
        title: "",
        company: article.client.name,
        avatar: article.author.image || "",
      },
      likes: article.interactions.likes,
      dislikes: article.interactions.dislikes,
      comments: article.interactions.comments,
      favorites: article.interactions.favorites,
      views: article.interactions.views,
      status: "published" as const,
    }));

    return { articles: posts, hasMore: pagination.page < pagination.totalPages };
  } catch (error) {
    console.error("[getMoreArticles] Error:", error);
    return { articles: [], hasMore: false };
  }
}
