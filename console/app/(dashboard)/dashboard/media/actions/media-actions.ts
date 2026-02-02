"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MediaType } from "@prisma/client";

export async function deleteMedia(mediaId: string, clientId: string) {
  try {
    const media = await db.media.findFirst({
      where: {
        id: mediaId,
        clientId,
      },
    });

    if (!media) {
      return { success: false, error: "Media not found" };
    }

    const usageCount = await db.article.count({
      where: { featuredImageId: mediaId },
    });

    if (usageCount > 0) {
      return {
        success: false,
        error: `Cannot delete media. It is used in ${usageCount} article(s).`,
      };
    }

    await db.media.delete({
      where: { id: mediaId },
    });

    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: message };
  }
}

export async function updateMediaMetadata(
  mediaId: string,
  clientId: string,
  data: {
    altText?: string;
    caption?: string;
    title?: string;
    description?: string;
  }
) {
  try {
    const media = await db.media.findFirst({
      where: {
        id: mediaId,
        clientId,
      },
    });

    if (!media) {
      return { success: false, error: "Media not found" };
    }

    await db.media.update({
      where: { id: mediaId },
      data: {
        ...(data.altText !== undefined && { altText: data.altText || null }),
        ...(data.caption !== undefined && { caption: data.caption || null }),
        ...(data.title !== undefined && { title: data.title || null }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
      },
    });

    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return { success: false, error: message };
  }
}

export async function setClientBrandingMedia(
  clientId: string,
  mediaType: "logo" | "ogImage" | "twitterImage",
  mediaId: string | null
) {
  try {
    const updateData: any = {};

    if (mediaType === "logo") {
      updateData.logoMediaId = mediaId;
    } else if (mediaType === "ogImage") {
      updateData.ogImageMediaId = mediaId;
    } else if (mediaType === "twitterImage") {
      updateData.twitterImageMediaId = mediaId;
    }

    await db.client.update({
      where: { id: clientId },
      data: updateData,
    });

    revalidatePath("/dashboard/media");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return { success: false, error: message };
  }
}
