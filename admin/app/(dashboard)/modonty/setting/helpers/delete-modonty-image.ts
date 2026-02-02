"use server";

import { db } from "@/lib/db";
import { deleteCloudinaryAsset } from "@/lib/utils/cloudinary-delete";

export async function deleteModontyImage(slug: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const page = await db.modonty.findUnique({
      where: { slug },
      select: { cloudinaryPublicId: true },
    });

    if (!page?.cloudinaryPublicId) {
      return { success: true };
    }

    const deleteResult = await deleteCloudinaryAsset(page.cloudinaryPublicId);

    if (!deleteResult.success) {
      console.warn("Failed to delete image from Cloudinary:", deleteResult.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteModontyImage:", error);
    return {
      success: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
