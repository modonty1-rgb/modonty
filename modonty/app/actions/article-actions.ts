"use server";

import { getArticles } from "@/app/api/helpers/article-queries";
import type { ArticleResponse } from "@/app/api/helpers/types";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  slug: string;
  publishedAt: Date;
  clientName: string;
  clientSlug: string;
  clientLogo?: string;
  author: {
    id: string;
    name: string;
    title: string;
    company: string;
    avatar: string;
  };
  likes: number;
  dislikes: number;
  comments: number;
  favorites: number;
  status: "published" | "draft";
}

interface LoadMoreArticlesResult {
  articles: Post[];
  hasMore: boolean;
}

export async function loadMoreArticles(page: number): Promise<LoadMoreArticlesResult> {
  try {
    const { articles, pagination } = await getArticles({
      page,
      limit: 10,
    });

    const posts = articles.map((article: ArticleResponse) => ({
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
