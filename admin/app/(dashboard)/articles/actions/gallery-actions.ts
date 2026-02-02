"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface GalleryItem {
  id: string;
  mediaId: string;
  position: number;
  caption?: string | null;
  altText?: string | null;
  media: {
    id: string;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
    filename: string;
  };
}

/**
 * Add an image to the article gallery
 */
export async function addImageToGallery(
  articleId: string,
  mediaId: string,
  position?: number
): Promise<{
  success: boolean;
  item?: GalleryItem;
  error?: string;
}> {
  try {
    if (!articleId || !mediaId) {
      return {
        success: false,
        error: "Article ID and Media ID are required",
      };
    }

    // Check if ArticleMedia already exists (prevent duplicates)
    const existing = await db.articleMedia.findUnique({
      where: {
        articleId_mediaId: {
          articleId,
          mediaId,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Image already exists in gallery",
      };
    }

    // Get max position if position not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPosition = await db.articleMedia.findFirst({
        where: { articleId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      finalPosition = maxPosition ? maxPosition.position + 1 : 0;
    }

    // Create ArticleMedia record
    const articleMedia = await db.articleMedia.create({
      data: {
        articleId,
        mediaId,
        position: finalPosition,
      },
      include: {
        media: {
          select: {
            id: true,
            url: true,
            altText: true,
            width: true,
            height: true,
            filename: true,
          },
        },
      },
    });

    // Revalidate article page
    revalidatePath(`/articles`);
    revalidatePath(`/articles/${articleId}`);

    return {
      success: true,
      item: {
        id: articleMedia.id,
        mediaId: articleMedia.mediaId,
        position: articleMedia.position,
        caption: articleMedia.caption,
        altText: articleMedia.altText,
        media: articleMedia.media,
      },
    };
  } catch (error) {
    console.error("Failed to add image to gallery:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Remove an image from the article gallery
 */
export async function removeImageFromGallery(
  articleId: string,
  mediaId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!articleId || !mediaId) {
      return {
        success: false,
        error: "Article ID and Media ID are required",
      };
    }

    // Delete ArticleMedia record
    await db.articleMedia.delete({
      where: {
        articleId_mediaId: {
          articleId,
          mediaId,
        },
      },
    });

    // Reorder remaining items (fill gaps)
    const remainingItems = await db.articleMedia.findMany({
      where: { articleId },
      orderBy: { position: "asc" },
    });

    // Update positions sequentially
    for (let i = 0; i < remainingItems.length; i++) {
      if (remainingItems[i].position !== i) {
        await db.articleMedia.update({
          where: { id: remainingItems[i].id },
          data: { position: i },
        });
      }
    }

    // Revalidate article page
    revalidatePath(`/articles`);
    revalidatePath(`/articles/${articleId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to remove image from gallery:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reorder gallery items
 */
export async function reorderGallery(
  articleId: string,
  items: Array<{ id: string; position: number }>
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!articleId || !items || items.length === 0) {
      return {
        success: false,
        error: "Article ID and items are required",
      };
    }

    // Use transaction for atomic updates
    await db.$transaction(
      items.map((item) =>
        db.articleMedia.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    // Revalidate article page
    revalidatePath(`/articles`);
    revalidatePath(`/articles/${articleId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to reorder gallery:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update gallery item (caption and altText)
 */
export async function updateGalleryItem(
  articleId: string,
  mediaId: string,
  updates: { caption?: string; altText?: string }
): Promise<{
  success: boolean;
  item?: GalleryItem;
  error?: string;
}> {
  try {
    if (!articleId || !mediaId) {
      return {
        success: false,
        error: "Article ID and Media ID are required",
      };
    }

    // Update ArticleMedia
    const articleMedia = await db.articleMedia.update({
      where: {
        articleId_mediaId: {
          articleId,
          mediaId,
        },
      },
      data: {
        ...(updates.caption !== undefined && { caption: updates.caption || null }),
        ...(updates.altText !== undefined && { altText: updates.altText || null }),
      },
      include: {
        media: {
          select: {
            id: true,
            url: true,
            altText: true,
            width: true,
            height: true,
            filename: true,
          },
        },
      },
    });

    // Revalidate article page
    revalidatePath(`/articles`);
    revalidatePath(`/articles/${articleId}`);

    return {
      success: true,
      item: {
        id: articleMedia.id,
        mediaId: articleMedia.mediaId,
        position: articleMedia.position,
        caption: articleMedia.caption,
        altText: articleMedia.altText,
        media: articleMedia.media,
      },
    };
  } catch (error) {
    console.error("Failed to update gallery item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get article gallery with Media relations
 */
export async function getArticleGallery(
  articleId: string
): Promise<{
  success: boolean;
  items?: GalleryItem[];
  error?: string;
}> {
  try {
    if (!articleId) {
      return {
        success: false,
        error: "Article ID is required",
      };
    }

    // Fetch all ArticleMedia with Media relations
    const articleMediaList = await db.articleMedia.findMany({
      where: { articleId },
      include: {
        media: {
          select: {
            id: true,
            url: true,
            altText: true,
            width: true,
            height: true,
            filename: true,
          },
        },
      },
      orderBy: { position: "asc" },
    });

    // Format gallery items
    const items: GalleryItem[] = articleMediaList.map((item) => ({
      id: item.id,
      mediaId: item.mediaId,
      position: item.position,
      caption: item.caption,
      altText: item.altText,
      media: item.media,
    }));

    return {
      success: true,
      items,
    };
  } catch (error) {
    console.error("Failed to get article gallery:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}