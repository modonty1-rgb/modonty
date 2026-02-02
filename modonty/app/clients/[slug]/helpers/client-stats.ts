import { db } from "@/lib/db";

export async function getClientStats(clientId: string) {
  try {
    // Get follower count (from ClientLike)
    const followersCount = await db.clientLike.count({
      where: { clientId },
    });

    // Get total views (from ClientView)
    const totalViews = await db.clientView.count({
      where: { clientId },
    });

    return {
      followers: followersCount,
      totalViews,
    };
  } catch (error) {
    return {
      followers: 0,
      totalViews: 0,
    };
  }
}

export async function getRelatedClients(clientId: string, industryId?: string | null, limit: number = 4) {
  try {
    if (!industryId) return [];

    const relatedClients = await db.client.findMany({
      where: {
        industryId: industryId,
        id: { not: clientId },
      },
      take: limit,
      include: {
        logoMedia: {
          select: {
            url: true,
          },
        },
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return relatedClients;
  } catch (error) {
    return [];
  }
}
