import { Media } from "@prisma/client";

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb" | "limit" | "pad";
  quality?: number | "auto";
  format?: "jpg" | "png" | "webp" | "gif" | "auto";
  gravity?: "auto" | "face" | "center" | "north" | "south" | "east" | "west";
  effect?: string;
}

/**
 * Generates a Cloudinary URL with transformations
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 * @returns Cloudinary URL with transformations
 */
export function generateCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!publicId) {
    return "";
  }

  const transformations: string[] = [];

  // Width and height
  if (options.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options.height) {
    transformations.push(`h_${options.height}`);
  }

  // Crop mode
  if (options.crop) {
    transformations.push(`c_${options.crop}`);
  }

  // Quality
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }

  // Format
  if (options.format) {
    transformations.push(`f_${options.format}`);
  }

  // Gravity
  if (options.gravity) {
    transformations.push(`g_${options.gravity}`);
  }

  // Effects
  if (options.effect) {
    transformations.push(`e_${options.effect}`);
  }

  const transformString = transformations.length > 0 ? transformations.join(",") + "/" : "";

  // Extract cloud name from environment or use default
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "your-cloud-name";

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
}

/**
 * Generates optimized image URL from Media object
 * @param media - Media object with Cloudinary public ID
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 */
export function getOptimizedImageUrl(
  media: Media,
  options: CloudinaryTransformOptions = {}
): string {
  if (!media.cloudinaryPublicId) {
    // Fallback to regular URL if no Cloudinary public ID
    return media.url;
  }

  return generateCloudinaryUrl(media.cloudinaryPublicId, options);
}

/**
 * Generates responsive image srcset
 * @param media - Media object with Cloudinary public ID
 * @param widths - Array of widths for srcset
 * @returns Srcset string
 */
export function generateResponsiveSrcset(
  media: Media,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string {
  if (!media.cloudinaryPublicId) {
    return "";
  }

  return widths
    .map((width) => {
      const url = generateCloudinaryUrl(media.cloudinaryPublicId!, {
        width,
        crop: "limit",
        quality: "auto",
        format: "auto",
      });
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Generates thumbnail URL
 * @param media - Media object with Cloudinary public ID
 * @param size - Thumbnail size (default: 200)
 * @returns Thumbnail URL
 */
export function getThumbnailUrl(media: Media, size: number = 200): string {
  if (!media.cloudinaryPublicId) {
    return media.thumbnailUrl || media.url;
  }

  return generateCloudinaryUrl(media.cloudinaryPublicId, {
    width: size,
    height: size,
    crop: "fill",
    quality: 80,
    format: "auto",
  });
}

/**
 * Preset transformation configurations
 */
export const CloudinaryPresets = {
  thumbnail: {
    width: 200,
    height: 200,
    crop: "fill" as const,
    quality: 80,
    format: "auto" as const,
  },
  small: {
    width: 640,
    crop: "limit" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  medium: {
    width: 1024,
    crop: "limit" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  large: {
    width: 1920,
    crop: "limit" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  hero: {
    width: 1920,
    height: 1080,
    crop: "fill" as const,
    quality: 85,
    format: "auto" as const,
    gravity: "auto" as const,
  },
};
