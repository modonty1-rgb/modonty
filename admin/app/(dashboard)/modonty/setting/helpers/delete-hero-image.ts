"use server";

import { db } from "@/lib/db";
import { deleteCloudinaryAsset } from "@/lib/utils/cloudinary-delete";

export async function deleteModontyHeroImage(slug: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const page = await db.modonty.findUnique({
      where: { slug },
      select: { heroImageCloudinaryPublicId: true },
    });

    if (!page?.heroImageCloudinaryPublicId) {
      return { success: true };
    }

    const deleteResult = await deleteCloudinaryAsset(page.heroImageCloudinaryPublicId);

    if (!deleteResult.success) {
      console.warn("Failed to delete hero image from Cloudinary:", deleteResult.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteModontyHeroImage:", error);
    return {
      success: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
