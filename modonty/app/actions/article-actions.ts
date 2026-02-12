"use server";

import { getArticles } from "@/app/api/helpers/article-queries";
import type { ArticleResponse, FeedPost } from "@/lib/types";

export interface LoadMoreArticlesResult {
  articles: FeedPost[];
  hasMore: boolean;
}

export async function loadMoreArticles(page: number, categorySlug?: string): Promise<LoadMoreArticlesResult> {
  try {
    const { articles, pagination } = await getArticles({
      page,
      limit: 10,
      ...(categorySlug && { category: categorySlug }),
    });

    const posts: FeedPost[] = articles.map((article: ArticleResponse) => ({
      id: article.id,
      title: article.title,
      content: article.excerpt || "",
      excerpt: article.excerpt ?? undefined,
      image: article.image,
      slug: article.slug,
      publishedAt: new Date(article.publishedAt),
      clientName: article.client.name,
      clientSlug: article.client.slug,
      clientLogo: article.client.logo,
      readingTimeMinutes: article.readingTimeMinutes,
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

    return {
      articles: posts,
      hasMore: pagination.page < pagination.totalPages,
    };
  } catch (error) {
    console.error("[loadMoreArticles] Error:", error);
    return {
      articles: [],
      hasMore: false,
    };
  }
}
