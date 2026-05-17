import { db } from "@/lib/db";

export type LikedItemType = "client" | "article" | "comment";

export interface LikedItem {
  id: string;
  type: LikedItemType;
  likedAt: Date;
  item: {
    id: string;
    name?: string;
    title?: string;
    slug: string;
    description?: string | null;
    excerpt?: string | null;
    image?: string;
    imageAlt?: string | null;
    client?: { name: string; slug: string };
  };
}

/**
 * Server-side counterpart of GET /api/users/[id]/liked. Merges client likes
 * and article likes into a single timeline, sorted by date desc. Per-request
 * (not cached) — profile is `noindex` and likes mutate interactively.
 */
export async function getProfileLiked(
  userId: string,
  limit = 20,
): Promise<LikedItem[]> {
  const safeLimit = Math.max(1, Math.min(limit, 50));

  const [clientLikes, articleLikes] = await Promise.all([
    db.clientLike.findMany({
      where: { userId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logoMedia: { select: { url: true, altText: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.articleLike.findMany({
      where: { userId },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featuredImage: { select: { url: true, altText: true } },
            client: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const clientItems: LikedItem[] = clientLikes.map((like) => ({
    id: like.id,
    type: "client",
    likedAt: like.createdAt,
    item: {
      id: like.client.id,
      name: like.client.name,
      slug: like.client.slug,
      description: like.client.description,
      image: like.client.logoMedia?.url,
      imageAlt: like.client.logoMedia?.altText,
    },
  }));

  const articleItems: LikedItem[] = articleLikes.map((like) => ({
    id: like.id,
    type: "article",
    likedAt: like.createdAt,
    item: {
      id: like.article.id,
      title: like.article.title,
      slug: like.article.slug,
      excerpt: like.article.excerpt,
      image: like.article.featuredImage?.url,
      imageAlt: like.article.featuredImage?.altText,
      client: like.article.client,
    },
  }));

  return [...clientItems, ...articleItems]
    .sort((a, b) => b.likedAt.getTime() - a.likedAt.getTime())
    .slice(0, safeLimit);
}
