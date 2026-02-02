"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { deleteCloudinaryAsset } from "./delete-cloudinary-asset";

export async function bulkDeleteMedia(ids: string[], clientId?: string) {
  try {
    const where: Prisma.MediaWhereInput = { id: { in: ids } };
    if (clientId) {
      where.clientId = clientId;
    }

    // Check each media for usage (articles + Client relations)
    const mediaList = await db.media.findMany({
      where,
      select: {
        id: true,
        filename: true,
        cloudinaryPublicId: true,
        mimeType: true,
        featuredArticles: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
          },
        },
        logoClients: {
          select: {
            id: true,
            name: true,
          },
        },
        ogImageClients: {
          select: {
            id: true,
            name: true,
          },
        },
        twitterImageClients: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Check for items that cannot be deleted
    const cannotDelete: Array<{
      id: string;
      filename: string;
      reason: string;
    }> = [];

    mediaList.forEach((m) => {
      if (m.featuredArticles.length > 0) {
        cannotDelete.push({
          id: m.id,
          filename: m.filename,
          reason: `Used in ${m.featuredArticles.length} published article(s)`,
        });
      } else if (m.logoClients.length > 0) {
        const names = m.logoClients.map((c) => c.name).join(", ");
        cannotDelete.push({
          id: m.id,
          filename: m.filename,
          reason: `Used as logo for client(s): ${names}`,
        });
      } else if (m.ogImageClients.length > 0) {
        const names = m.ogImageClients.map((c) => c.name).join(", ");
        cannotDelete.push({
          id: m.id,
          filename: m.filename,
          reason: `Used as OG image for client(s): ${names}`,
        });
      } else if (m.twitterImageClients.length > 0) {
        const names = m.twitterImageClients.map((c) => c.name).join(", ");
        cannotDelete.push({
          id: m.id,
          filename: m.filename,
          reason: `Used as Twitter image for client(s): ${names}`,
        });
      }
    });

    // Filter out protected items - only delete items that can be deleted
    const cannotDeleteIds = new Set(cannotDelete.map((m) => m.id));
    const deletableMedia = mediaList.filter((m) => !cannotDeleteIds.has(m.id));

    // If all items are protected, return error
    if (deletableMedia.length === 0) {
      const errorDetails = cannotDelete
        .map((m) => `${m.filename}: ${m.reason}`)
        .join("\n");
      return {
        success: false,
        error: `${cannotDelete.length} media file(s) are in use and cannot be deleted:\n${errorDetails}`,
        cannotDelete: cannotDelete.map((m) => ({ id: m.id, filename: m.filename, reason: m.reason })),
        deleted: 0,
        skipped: cannotDelete.length,
      };
    }

    // Delete from Cloudinary for deletable media with public_id
    const deletePromises = deletableMedia
      .filter((m) => m.cloudinaryPublicId)
      .map((m) => {
        const resourceType = m.mimeType.startsWith("image/") ? "image" : "video";
        return deleteCloudinaryAsset(m.cloudinaryPublicId!, resourceType);
      });

    // Execute Cloudinary deletions (don't fail if some fail)
    await Promise.allSettled(deletePromises);

    // Delete only deletable items from database
    const deletableIds = deletableMedia.map((m) => m.id);
    await db.media.deleteMany({ where: { id: { in: deletableIds } } });
    revalidatePath("/media");

    // Return success with details about what was deleted and skipped
    return {
      success: true,
      deleted: deletableIds.length,
      skipped: cannotDelete.length,
      cannotDelete: cannotDelete.length > 0 ? cannotDelete.map((m) => ({ id: m.id, filename: m.filename, reason: m.reason })) : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete media";
    return { success: false, error: message };
  }
}
