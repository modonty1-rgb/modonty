"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getMediaById(id: string, clientId?: string) {
  try {
    const where: Prisma.MediaWhereInput = { id };

    // If clientId provided, ensure media belongs to that client (security)
    if (clientId) {
      where.clientId = clientId;
    }

    return await db.media.findFirst({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        featuredArticles: {
          select: {
            id: true,
            title: true,
            slug: true,
            clientId: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching media by ID:", error);
    return null;
  }
}
