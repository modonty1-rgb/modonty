"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ImageUploadData } from "@/components/shared/deferred-image-upload";
import { generateSEOFileName } from "@/lib/utils/image-seo";
import { uploadToBunny } from "@modonty/shared/lib/bunny";

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

// Bunny-primary (2026-07-29): entity social images go to the platform assets zone
// under social/{table}/. No Cloudinary — the retired path is kept below as text.
export async function uploadImage(
  params: UploadImageParams
): Promise<{ success: boolean; result?: ImageUploadResult; error?: string }> {
  const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };
  const { imageData, tableName, urlFieldName, altFieldName, recordId, initialId } = params;

  if (!imageData?.file) {
    return { success: true };
  }

  try {
    const altText = imageData.altText;
    if (!altText || altText.trim().length === 0) {
      return {
        success: false,
        error: "Alt text is required for SEO and accessibility.",
      };
    }
    if (!imageData.file.type.startsWith("image/")) {
      return { success: false, error: "Only images are allowed." };
    }

    // SEO-friendly basename + the REAL extension (extension must survive so the
    // CDN serves the correct content-type — lesson from the media-library fix).
    const seoBase = generateSEOFileName(altText, "", imageData.file.name, undefined, true);
    const ext = (imageData.file.name.match(/\.[a-z0-9]+$/i)?.[0] || ".webp").toLowerCase();
    const remotePath = `social/${tableName}/${seoBase}${ext}`;

    const buffer = Buffer.from(await imageData.file.arrayBuffer());
    const { url: bunnyImageUrl } = await uploadToBunny("assets", buffer, remotePath, imageData.file.type);

    const updateData: Record<string, string> = {
      [urlFieldName]: bunnyImageUrl,
      [altFieldName]: altText.trim(),
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
        socialImageUrl: bunnyImageUrl,
        socialImageAlt: altText,
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

/**
 * ⛔ RETIRED (2026-07-29, tripwire rule) — the old Cloudinary entity-image upload,
 * kept as text only. Never call: throws so a hidden Cloudinary path can't fail
 * silently. Final disposal of all Cloudinary code = last migration phase.
 */
export async function uploadImageCloudinaryRETIRED(): Promise<never> {
  throw new Error("RETIRED: Cloudinary entity-image upload is disabled — uploadImage now uses Bunny.");
  /* Original implementation (text, for reference):
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const seoFileName = generateSEOFileName(altText, "", imageData.file.name, undefined, true);
  const publicId = seoFileName; // Root level - no folder path
  const assetFolder = tableName;
  if (!isValidCloudinaryPublicId(publicId)) return error;
  const formData = new FormData();
  formData.append("file", imageData.file);
  formData.append("upload_preset", uploadPreset);
  formData.append("public_id", publicId);
  formData.append("asset_folder", assetFolder);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
  const result = await response.json();
  const optimizedUrl = optimizeCloudinaryUrl(result.secure_url || result.url, result.public_id, result.format, "image");
  updateData = { [urlFieldName]: optimizedUrl, [altFieldName]: altText.trim(), cloudinaryPublicId: result.public_id };
  */
}
