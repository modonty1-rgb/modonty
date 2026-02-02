"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma, MediaType } from "@prisma/client";

interface CreateMediaData {
  filename: string;
  url: string;
  mimeType: string;
  clientId: string; // REQUIRED
  type?: MediaType;
  fileSize?: number;
  width?: number;
  height?: number;
  encodingFormat?: string;
  altText: string; // REQUIRED for SEO and accessibility
  caption?: string;
  credit?: string;
  title?: string;
  description?: string;
  license?: string;
  creator?: string;
  dateCreated?: Date;
  geoLatitude?: number;
  geoLongitude?: number;
  geoLocationName?: string;
  contentLocation?: string;
  exifData?: Record<string, unknown>;
  cloudinaryPublicId?: string;
  cloudinaryVersion?: string;
  cloudinarySignature?: string;
}

function validateMimeType(mimeType: string): boolean {
  const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];

  return allowedMimeTypes.includes(mimeType.toLowerCase());
}

function validateFileSize(fileSize: number | undefined, mimeType: string): { valid: boolean; error?: string } {
  if (!fileSize) return { valid: true };

  const maxSizes: Record<string, number> = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
  };

  const fileCategory = mimeType.split("/")[0];
  const maxSize = maxSizes[fileCategory];

  if (fileSize > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File too large. Maximum size for ${fileCategory} files is ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}

export async function createMedia(data: CreateMediaData) {
  try {
    // Validate altText is required
    if (!data.altText || data.altText.trim().length === 0) {
      return { success: false, error: "Alt text is required for SEO and accessibility." };
    }

    // Validate clientId exists
    const client = await db.client.findUnique({
      where: { id: data.clientId },
      select: { id: true },
    });

    if (!client) {
      return { success: false, error: "Invalid client ID. Client not found." };
    }

    // Validate file type
    if (!validateMimeType(data.mimeType)) {
      return {
        success: false,
        error: `File type not allowed. Allowed types: images (jpg, png, gif, webp, svg), videos (mp4, webm)`,
      };
    }

    // Validate file size
    const sizeValidation = validateFileSize(data.fileSize, data.mimeType);
    if (!sizeValidation.valid) {
      return {
        success: false,
        error: sizeValidation.error || "File size validation failed",
      };
    }

    const media = await db.media.create({
      data: {
        filename: data.filename,
        url: data.url,
        mimeType: data.mimeType,
        clientId: data.clientId,
        type: data.type || "GENERAL",
        fileSize: data.fileSize,
        width: data.width,
        height: data.height,
        encodingFormat: data.encodingFormat,
        altText: data.altText,
        caption: data.caption,
        credit: data.credit,
        title: data.title,
        description: data.description,
        license: data.license,
        creator: data.creator,
        dateCreated: data.dateCreated,
        geoLatitude: data.geoLatitude,
        geoLongitude: data.geoLongitude,
        geoLocationName: data.geoLocationName,
        contentLocation: data.contentLocation,
        exifData: data.exifData ? (JSON.parse(JSON.stringify(data.exifData)) as Prisma.InputJsonValue) : null,
        cloudinaryPublicId: data.cloudinaryPublicId,
        cloudinaryVersion: data.cloudinaryVersion,
        cloudinarySignature: data.cloudinarySignature,
      },
    });
    revalidatePath("/media");
    return { success: true, media };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create media";
    return { success: false, error: message };
  }
}
