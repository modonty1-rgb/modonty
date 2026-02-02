"use server";

import { db } from "@/lib/db";

export async function getClientMedia(clientId: string) {
  try {
    const media = await db.media.findMany({
      where: {
        clientId,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        url: true,
        mimeType: true,
        fileSize: true,
        width: true,
        height: true,
        altText: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        cloudinaryPublicId: true,
        cloudinaryVersion: true,
      },
    });

    return media;
  } catch (error) {
    console.error("Error fetching client media:", error);
    return [];
  }
}
