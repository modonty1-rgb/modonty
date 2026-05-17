import { db } from "@/lib/db";

export type DislikedItemType = "client" | "article" | "comment";

export interface DislikedItem {
  id: string;
  type: DislikedItemType;
  dislikedAt: Date;
  item: {
    id: string;
    name?: string;
    title?: string;
    slug?: string;
    description?: string | null;
    excerpt?: string | null;
    content?: string;
    image?: string;
    imageAlt?: string | null;
    client?: { name: string; slug: string };
    author?: { id: string; name: string | null; image: string | null };
    article?: {
      id: string;
      title: string;
      slug: string;
      client: { name: string; slug: string };
    };
    commentCreatedAt?: Date;
  };
}

/**
 * Server-side counterpart of GET /api/users/[id]/disliked. Merges client +
 * article + comment dislikes into a single timeline sorted by date desc.
 * Per-request (not cached) — profile is `noindex` and counts mutate.
 */
export async function getProfileDisliked(
  userId: string,
  limit = 20,
): Promise<DislikedItem[]> {
  const safeLimit = Math.max(1, Math.min(limit, 50));

  const [clientDislikes, articleDislikes, commentDislikes] = await Promise.all([
    db.clientDislike.findMany({
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
    db.articleDislike.findMany({
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
    db.commentDislike.findMany({
      where: { userId },
      include: {
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, name: true, image: true } },
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                client: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const clientItems: DislikedItem[] = clientDislikes.map((dislike) => ({
    id: dislike.id,
    type: "client",
    dislikedAt: dislike.createdAt,
    item: {
      id: dislike.client.id,
      name: dislike.client.name,
      slug: dislike.client.slug,
      description: dislike.client.description,
      image: dislike.client.logoMedia?.url,
      imageAlt: dislike.client.logoMedia?.altText,
    },
  }));

  const articleItems: DislikedItem[] = articleDislikes.map((dislike) => ({
    id: dislike.id,
    type: "article",
    dislikedAt: dislike.createdAt,
    item: {
      id: dislike.article.id,
      title: dislike.article.title,
      slug: dislike.article.slug,
      excerpt: dislike.article.excerpt,
      image: dislike.article.featuredImage?.url,
      imageAlt: dislike.article.featuredImage?.altText,
      client: dislike.article.client,
    },
  }));

  const commentItems: DislikedItem[] = commentDislikes.map((dislike) => ({
    id: dislike.id,
    type: "comment",
    dislikedAt: dislike.createdAt,
    item: {
      id: dislike.comment.id,
      content: dislike.comment.content,
      slug: dislike.comment.article.slug,
      author: dislike.comment.author ?? undefined,
      article: dislike.comment.article,
      commentCreatedAt: dislike.comment.createdAt,
    },
  }));

  return [...clientItems, ...articleItems, ...commentItems]
    .sort((a, b) => b.dislikedAt.getTime() - a.dislikedAt.getTime())
    .slice(0, safeLimit);
}
