"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getMediaUsage(id: string, clientId?: string) {
  try {
    const where: Prisma.MediaWhereInput = { id };
    if (clientId) {
      where.clientId = clientId;
    }

    const media = await db.media.findFirst({
      where,
      include: {
        featuredArticles: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            clientId: true,
          },
        },
        logoClients: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        heroImageClients: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!media) {
      return { success: false, error: "Media not found" };
    }

    const usage = {
      featuredIn: media.featuredArticles,
      inArticle: [],
      totalUsage: media.featuredArticles.length,
      clientUsage: {
        logoClients: media.logoClients,
        heroImageClients: media.heroImageClients,
      },
    };

    return { success: true, usage };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get media usage";
    return { success: false, error: message };
  }
}
