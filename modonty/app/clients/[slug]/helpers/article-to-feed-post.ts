import type { ArticleResponse, FeedPost } from "@/lib/types";

export function articleToFeedPost(article: ArticleResponse): FeedPost {
  return {
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
    status: "published",
  };
}
