import { db } from "@/lib/db";

export async function getClientEngagementBySlug(rawSlug: string) {
  const decodedSlug = decodeURIComponent(rawSlug);

  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!client) {
    return null;
  }

  const [followersCount, favoritesCount, articleLikesCount] = await Promise.all([
    db.clientLike.count({
      where: { clientId: client.id },
    }),
    db.clientFavorite.count({
      where: { clientId: client.id },
    }),
    db.articleLike.count({
      where: {
        article: {
          clientId: client.id,
        },
      },
    }),
  ]);

  return {
    client,
    followersCount,
    favoritesCount,
    articleLikesCount,
  };
}

