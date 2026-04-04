"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MediaType } from "@prisma/client";
import { generateAndSaveJsonLd } from "@/lib/seo";

interface UpdateMediaData {
  type?: MediaType;
  altText?: string;
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
  cloudinaryPublicId?: string;
  cloudinaryVersion?: string;
  cloudinarySignature?: string;
  url?: string;
  filename?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  encodingFormat?: string;
}

export async function updateMedia(id: string, data: UpdateMediaData) {
  try {
    const media = await db.media.update({
      where: { id },
      data: {
        type: data.type,
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
        cloudinaryPublicId: data.cloudinaryPublicId,
        cloudinaryVersion: data.cloudinaryVersion,
        cloudinarySignature: data.cloudinarySignature,
        ...(data.url !== undefined ? { url: data.url } : {}),
        ...(data.filename !== undefined ? { filename: data.filename } : {}),
        ...(data.mimeType !== undefined ? { mimeType: data.mimeType } : {}),
        ...(data.width !== undefined ? { width: data.width } : {}),
        ...(data.height !== undefined ? { height: data.height } : {}),
        ...(data.fileSize !== undefined ? { fileSize: data.fileSize } : {}),
        ...(data.encodingFormat !== undefined ? { encodingFormat: data.encodingFormat } : {}),
      },
    });

    // Regenerate JSON-LD for all articles using this media
    const relatedArticles = await db.article.findMany({
      where: {
        OR: [
          { featuredImageId: id },
          { gallery: { some: { mediaId: id } } },
        ],
      },
      select: { id: true },
    });

    if (relatedArticles.length > 0) {
      await Promise.all(
        relatedArticles.map((article) => generateAndSaveJsonLd(article.id).catch(() => null))
      );
    }

    revalidatePath("/media");
    return { success: true, media };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update media";
    return { success: false, error: message };
  }
}
