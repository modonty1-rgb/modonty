"use server";

import { db } from "@/lib/db";
import { deleteCloudinaryAsset } from "@/lib/utils/cloudinary-delete";

type EntityTableName = "categories" | "tags" | "industries" | "authors";

export async function deleteOldImage(
  tableName: EntityTableName,
  recordId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!recordId) {
      return { success: true };
    }

    let cloudinaryPublicId: string | null = null;

    switch (tableName) {
      case "categories":
        const category = await db.category.findUnique({
          where: { id: recordId },
          select: { cloudinaryPublicId: true },
        });
        cloudinaryPublicId = category?.cloudinaryPublicId || null;
        break;

      case "tags":
        const tag = await db.tag.findUnique({
          where: { id: recordId },
          select: { cloudinaryPublicId: true },
        });
        cloudinaryPublicId = tag?.cloudinaryPublicId || null;
        break;

      case "industries":
        const industry = await db.industry.findUnique({
          where: { id: recordId },
          select: { cloudinaryPublicId: true },
        });
        cloudinaryPublicId = industry?.cloudinaryPublicId || null;
        break;

      case "authors":
        const author = await db.author.findUnique({
          where: { id: recordId },
          select: { cloudinaryPublicId: true },
        });
        cloudinaryPublicId = author?.cloudinaryPublicId || null;
        break;
    }

    if (!cloudinaryPublicId) {
      return { success: true };
    }

    const deleteResult = await deleteCloudinaryAsset(cloudinaryPublicId);

    if (!deleteResult.success) {
      console.warn("Failed to delete image from Cloudinary:", deleteResult.error);
    }

    return { success: true };
  } catch (error) {
    console.error(`Error in deleteOldImage for ${tableName}:`, error);
    return {
      success: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
