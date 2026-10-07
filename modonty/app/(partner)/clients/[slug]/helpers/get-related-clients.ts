import { SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function getRelatedClients(clientId: string, industryId?: string | null, limit: number = 4) {
  try {
    if (!industryId) return [];

    const relatedClients = await db.client.findMany({
      where: {
        industryId: industryId,
        id: { not: clientId },
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
      take: limit,
      include: {
        logoMedia: {
          select: {
            url: true, bunnyUrl: true, blurDataURL: true,
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
