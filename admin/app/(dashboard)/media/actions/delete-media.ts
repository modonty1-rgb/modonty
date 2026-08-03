"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { canDeleteMedia } from "./can-delete-media";
import { deleteCloudinaryAsset } from "./delete-cloudinary-asset";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { deleteBunnyUrl, bunnyAspectUrl, BUNNY_ASPECT_SUFFIX } from "@modonty/database/lib/bunny";

export async function deleteMedia(id: string, clientId?: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // Check if media can be deleted
    const canDelete = await canDeleteMedia(id, clientId);
    if (!canDelete.canDelete) {
      return {
        success: false,
        error: canDelete.reason || "Cannot delete media",
        usage: canDelete.usage,
      };
    }

    const where: Prisma.MediaWhereUniqueInput = { id };

    // Get media record to check for Cloudinary public_id
    const media = await db.media.findUnique({
      where: { id },
      select: {
        id: true,
        cloudinaryPublicId: true,
        bunnyUrl: true,
        type: true,
        mimeType: true,
        clientId: true,
      },
    });

    if (!media) {
      return { success: false, error: "Media not found" };
    }

    if (clientId && media.clientId !== clientId) {
      return { success: false, error: "Media not found or access denied" };
    }

    // Delete from Cloudinary if public_id exists
    if (media.cloudinaryPublicId) {
      const resourceType = media.mimeType.startsWith("image/") ? "image" : "video";
      const cloudinaryResult = await deleteCloudinaryAsset(media.cloudinaryPublicId, resourceType);

      if (!cloudinaryResult.success) {
        // Return error to prevent database deletion if Cloudinary deletion fails
        return {
          success: false,
          error: `Failed to delete from Cloudinary: ${cloudinaryResult.error}. The file was not deleted from the database.`,
        };
      }
    } else {
      // Log warning if no Cloudinary public_id (might be old record)
      console.warn("Media record has no cloudinaryPublicId, skipping Cloudinary deletion");
    }

    // Delete the Bunny mirror — best-effort, must never block the DB deletion (P2-3).
    // Article images also have 3 aspect crops next to the base → remove them too.
    if (media.bunnyUrl) {
      try {
        await deleteBunnyUrl("clients", media.bunnyUrl);
        if (media.type === "POST") {
          for (const suffix of Object.values(BUNNY_ASPECT_SUFFIX)) {
            await deleteBunnyUrl("clients", bunnyAspectUrl(media.bunnyUrl, suffix));
          }
        }
      } catch {
        console.warn("Bunny delete failed (mirror), continuing with DB deletion");
      }
    }

    // Delete from database
    await db.media.delete({ where });

    await logAction("media.delete", {
      entity: "Media",
      entityId: media.id,
      summary: media.cloudinaryPublicId ?? media.id,
      metadata: media.clientId ? { clientId: media.clientId } : null,
    });

    revalidatePath("/media");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete media";
    return { success: false, error: message };
  }
}
