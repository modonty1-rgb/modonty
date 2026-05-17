import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export interface FavoritedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: Date | null;
  featuredImage: { url: string; altText: string | null } | null;
  client: { id: string; name: string; slug: string; logo: string | null };
  author: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string } | null;
  favoritedAt: Date;
}

/**
 * Server-side counterpart of GET /api/users/[id]/favorites. Filters out
 * unpublished articles. Per-request (not cached) — profile is `noindex` and
 * favorites change interactively.
 */
export async function getProfileFavorites(
  userId: string,
  limit = 20,
): Promise<FavoritedArticle[]> {
  const safeLimit = Math.max(1, Math.min(limit, 50));

  const favorites = await db.articleFavorite.findMany({
    where: { userId },
    select: {
      createdAt: true,
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          datePublished: true,
          status: true,
          featuredImage: { select: { url: true, altText: true } },
          client: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoMedia: { select: { url: true } },
            },
          },
          author: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: safeLimit,
  });

  return favorites
    .filter((fav) => fav.article.status === ArticleStatus.PUBLISHED)
    .map((fav) => ({
      id: fav.article.id,
      title: fav.article.title,
      slug: fav.article.slug,
      excerpt: fav.article.excerpt,
      datePublished: fav.article.datePublished,
      featuredImage: fav.article.featuredImage
        ? { url: fav.article.featuredImage.url, altText: fav.article.featuredImage.altText }
        : null,
      client: {
        id: fav.article.client.id,
        name: fav.article.client.name,
        slug: fav.article.client.slug,
        logo: fav.article.client.logoMedia?.url ?? null,
      },
      author: {
        id: fav.article.author.id,
        name: fav.article.author.name,
        slug: fav.article.author.slug,
      },
      category: fav.article.category,
      favoritedAt: fav.createdAt,
    }));
}
