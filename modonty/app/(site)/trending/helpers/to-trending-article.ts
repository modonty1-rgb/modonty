import type { ArticleResponse } from "@/lib/types";

// Map to component format
export const toTrendingArticle = (article: ArticleResponse) => ({
  id: article.id,
  title: article.title,
  excerpt: article.excerpt,
  slug: article.slug,
  image: article.image,
  publishedAt: article.publishedAt,
  client: {
    name: article.client.name,
    slug: article.client.slug,
    logo: article.client.logo,
  },
  category: article.category,
  interactions: {
    views: article.interactions.views,
    likes: article.interactions.likes,
    comments: article.interactions.comments,
  },
  readingTimeMinutes: article.readingTimeMinutes,
});
