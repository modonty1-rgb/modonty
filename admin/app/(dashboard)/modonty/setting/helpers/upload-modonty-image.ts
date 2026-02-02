"use server";

import { ImageUploadData } from "@/components/shared/deferred-image-upload";
import {
  generateSEOFileName,
  isValidCloudinaryPublicId,
  optimizeCloudinaryUrl,
} from "@/lib/utils/image-seo";

export interface ModontyImageUploadResult {
  socialImageUrl?: string;
  socialImageAlt?: string;
  cloudinaryPublicId?: string;
}

export async function uploadModontyImage(
  imageData: ImageUploadData | null,
  slug: string
): Promise<{ success: boolean; result?: ModontyImageUploadResult; error?: string }> {
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

    // Generate SEO-friendly filename
    const seoFileName = generateSEOFileName(altText, "", imageData.file.name, undefined, true);
    const publicId = `modonty/${slug}/${seoFileName}`;

    if (!isValidCloudinaryPublicId(publicId)) {
      return {
        success: false,
        error: "Generated filename is invalid. Please check your alt text.",
      };
    }

    const formData = new FormData();
    formData.append("file", imageData.file);
    formData.append("upload_preset", uploadPreset);
    formData.append("public_id", publicId);
    formData.append("asset_folder", `modonty/${slug}`);

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

    return {
      success: true,
      result: {
        socialImageUrl: optimizedUrl,
        socialImageAlt: altText.trim(),
        cloudinaryPublicId: cloudinaryPublicId,
      },
    };
  } catch (error) {
    console.error("Error in uploadModontyImage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
