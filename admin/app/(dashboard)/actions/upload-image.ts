"use server";

import { db } from "@/lib/db";
import { ImageUploadData } from "@/components/shared/deferred-image-upload";
import { generateSEOFileName, isValidCloudinaryPublicId, optimizeCloudinaryUrl } from "@/lib/utils/image-seo";

type EntityTableName = "categories" | "tags" | "industries" | "authors";

export interface ImageUploadResult {
  socialImageUrl?: string;
  socialImageAlt?: string;
  cloudinaryPublicId?: string;
}

interface UploadImageParams {
  imageData: ImageUploadData | null;
  tableName: EntityTableName;
  urlFieldName: string;
  altFieldName: string;
  slug: string;
  name: string;
  recordId?: string;
  initialId?: string;
}

export async function uploadImage(
  params: UploadImageParams
): Promise<{ success: boolean; result?: ImageUploadResult; error?: string }> {
  const { imageData, tableName, urlFieldName, altFieldName, slug, name, recordId, initialId } = params;

  if (!imageData?.file) {
    return { success: true };
  }

  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return {
        success: false,
        error: "Cloudinary configuration missing. Please check your environment variables.",
      };
    }

    const altText = imageData.altText;
    if (!altText || altText.trim().length === 0) {
      return {
        success: false,
        error: "Alt text is required for SEO and accessibility.",
      };
    }

    // Generate SEO-friendly filename (root level - no folder in public_id)
    const seoFileName = generateSEOFileName(altText, "", imageData.file.name, undefined, true);
    const publicId = seoFileName; // Root level - no folder path

    // Asset folder for Media Library organization only (doesn't affect URL)
    const assetFolder = tableName;

    if (!isValidCloudinaryPublicId(publicId)) {
      return {
        success: false,
        error: "Generated filename is invalid. Please check your alt text.",
      };
    }

    const formData = new FormData();
    formData.append("file", imageData.file);
    formData.append("upload_preset", uploadPreset);
    formData.append("public_id", publicId); // Root level filename
    formData.append("asset_folder", assetFolder); // Media Library organization

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Upload failed with status ${response.status}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    const result = await response.json();
    const cloudinaryUrl = result.secure_url || result.url;
    const cloudinaryPublicId = result.public_id;

    const optimizedUrl = optimizeCloudinaryUrl(
      cloudinaryUrl,
      cloudinaryPublicId,
      result.format,
      "image"
    );

    const updateData: Record<string, string> = {
      [urlFieldName]: optimizedUrl,
      [altFieldName]: altText.trim(),
      cloudinaryPublicId: cloudinaryPublicId,
    };

    if (recordId || initialId) {
      try {
        switch (tableName) {
          case "categories":
            await db.category.update({
              where: { id: recordId || initialId },
              data: updateData,
            });
            break;
          case "tags":
            await db.tag.update({
              where: { id: recordId || initialId },
              data: updateData,
            });
            break;
          case "industries":
            await db.industry.update({
              where: { id: recordId || initialId },
              data: updateData,
            });
            break;
          case "authors":
            await db.author.update({
              where: { id: recordId || initialId },
              data: updateData,
            });
            break;
        }
      } catch (updateError) {
        console.error("Error updating record:", updateError);
        return {
          success: false,
          error: `Failed to update ${tableName} record: ${updateError instanceof Error ? updateError.message : "Unknown error"}`,
        };
      }
    }

    return {
      success: true,
      result: {
        socialImageUrl: optimizedUrl,
        socialImageAlt: altText,
        cloudinaryPublicId: cloudinaryPublicId,
      },
    };
  } catch (error) {
    console.error("Error in uploadImage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
