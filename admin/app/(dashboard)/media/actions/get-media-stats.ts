"use server";

import { db } from "@/lib/db";

function normalizeImageTypeCounts(
  imageTypesRaw: Array<{ mimeType: string; _count: { _all: number } }>
) {
  return imageTypesRaw.reduce(
    (acc, item) => {
      const mime = item.mimeType.toLowerCase();
      const count = item._count._all;

      if (mime.includes("jpeg") || mime.includes("jpg")) {
        acc.jpeg += count;
      } else if (mime.includes("png")) {
        acc.png += count;
      } else if (mime.includes("webp")) {
        acc.webp += count;
      } else if (mime.includes("svg")) {
        acc.svg += count;
      } else {
        acc.other += count;
      }

      return acc;
    },
    {
      jpeg: 0,
      png: 0,
      webp: 0,
      svg: 0,
      other: 0,
    }
  );
}

function normalizeMediaTypeCounts(
  mediaTypesRaw: Array<{ type: string | null }>
) {
  return mediaTypesRaw.reduce(
    (acc, item) => {
      const type = item.type || "NULL";
      if (type === "GENERAL") acc.GENERAL += 1;
      else if (type === "LOGO") acc.LOGO += 1;
      else if (type === "OGIMAGE") acc.OGIMAGE += 1;
      else if (type === "POST") acc.POST += 1;
      else if (type === "TWITTER_IMAGE") acc.TWITTER_IMAGE += 1;
      else if (type === "NULL") {
        acc.NULL = (acc.NULL || 0) + 1;
      }
      return acc;
    },
    {
      GENERAL: 0,
      LOGO: 0,
      OGIMAGE: 0,
      POST: 0,
      TWITTER_IMAGE: 0,
      NULL: 0,
    }
  );
}

export async function getMediaStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get Cloudinary usage info (don't block if it fails)
    const { getCloudinaryUsage } = await import("@/lib/utils/cloudinary-usage");
    const cloudinaryUsage = await getCloudinaryUsage().catch((error) => {
      // Log error even when caught to help with debugging
      if (process.env.NODE_ENV === "development" || process.env.CLOUDINARY_DEBUG === "true") {
        console.error("Failed to fetch Cloudinary usage in getMediaStats:", {
          message: error?.message,
          error: error,
        });
      }
      return {
        success: false,
        usedStorage: undefined,
        totalStorage: undefined,
        remainingStorage: undefined,
        details: undefined,
      };
    });

    const [
      total,
      images,
      videos,
      used,
      unused,
      createdThisMonth,
      totalSize,
      imageTypesRaw,
      mediaTypesRaw,
      // Detailed usage breakdown
      inArticles,
      asLogos,
      asOGImages,
      asTwitterImages,
    ] = await Promise.all([
      // Total media
      db.media.count({
        where: {
          clientId: { not: null },
        },
      }),
      // Images
      db.media.count({
        where: {
          clientId: { not: null },
          mimeType: { startsWith: "image/" },
        },
      }),
      // Videos
      db.media.count({
        where: {
          clientId: { not: null },
          mimeType: { startsWith: "video/" },
        },
      }),
      // Used (featured in articles)
      db.media.count({
        where: {
          clientId: { not: null },
          featuredArticles: { some: {} },
        },
      }),
      // Unused (not featured in any articles)
      db.media.count({
        where: {
          clientId: { not: null },
          featuredArticles: { none: {} },
        },
      }),
      // Created this month
      db.media.count({
        where: {
          clientId: { not: null },
          createdAt: { gte: startOfMonth },
        },
      }),
      // Total file size
      db.media.aggregate({
        where: {
          clientId: { not: null },
        },
        _sum: {
          fileSize: true,
        },
      }),
      // Image type breakdown
      db.media.groupBy({
        by: ["mimeType"],
        where: {
          clientId: { not: null },
          mimeType: { startsWith: "image/" },
        },
        _count: {
          _all: true,
        },
      }),
      // Media type breakdown (GENERAL, LOGO, OGIMAGE, etc.)
      // Get all media to count types manually (can't use groupBy with null enum values)
      db.media.findMany({
        where: {
          clientId: { not: null },
        },
        select: {
          type: true,
        },
      }),
      // Detailed usage breakdown: Media featured in articles
      db.media.count({
        where: {
          clientId: { not: null },
          featuredArticles: { some: {} },
        },
      }),
      // Detailed usage breakdown: Media used as client logos
      db.media.count({
        where: {
          clientId: { not: null },
          logoClients: { some: {} },
        },
      }),
      // Detailed usage breakdown: Media used as OG images
      db.media.count({
        where: {
          clientId: { not: null },
          ogImageClients: { some: {} },
        },
      }),
      // Detailed usage breakdown: Media used as Twitter images
      db.media.count({
        where: {
          clientId: { not: null },
          twitterImageClients: { some: {} },
        },
      }),
    ]);

    const imageTypeCounts = normalizeImageTypeCounts(imageTypesRaw);
    const mediaTypeCounts = normalizeMediaTypeCounts(mediaTypesRaw);

    // Calculate total used (union of all usage types - a media can be used in multiple ways)
    const totalUsedUnique = await db.media.count({
      where: {
        clientId: { not: null },
        OR: [
          { featuredArticles: { some: {} } },
          { logoClients: { some: {} } },
          { ogImageClients: { some: {} } },
          { twitterImageClients: { some: {} } },
        ],
      },
    });

    // Unused = total - totalUsedUnique
    const unusedDetailed = total - totalUsedUnique;

    return {
      total,
      images,
      videos,
      used,
      unused,
      createdThisMonth,
      totalSize: totalSize._sum.fileSize || 0,
      imageTypes: imageTypeCounts,
      mediaTypes: mediaTypeCounts,
      cloudinaryUsed: cloudinaryUsage.usedStorage,
      cloudinaryTotal: cloudinaryUsage.totalStorage,
      cloudinaryRemaining: cloudinaryUsage.remainingStorage,
      cloudinaryDetails: cloudinaryUsage.details || undefined,
      usageBreakdown: {
        inArticles,
        asLogos,
        asOGImages,
        asTwitterImages,
        totalUsed: totalUsedUnique,
        unused: unusedDetailed,
      },
    };
  } catch (error) {
    console.error("Error fetching media stats:", error);
    return {
      total: 0,
      images: 0,
      videos: 0,
      used: 0,
      unused: 0,
      createdThisMonth: 0,
      totalSize: 0,
      imageTypes: {
        jpeg: 0,
        png: 0,
        webp: 0,
        svg: 0,
        other: 0,
      },
      mediaTypes: {
        GENERAL: 0,
        LOGO: 0,
        OGIMAGE: 0,
        POST: 0,
        TWITTER_IMAGE: 0,
      },
      cloudinaryUsed: undefined,
      cloudinaryTotal: undefined,
      cloudinaryRemaining: undefined,
      cloudinaryDetails: undefined,
      usageBreakdown: {
        inArticles: 0,
        asLogos: 0,
        asOGImages: 0,
        asTwitterImages: 0,
        totalUsed: 0,
        unused: 0,
      },
    };
  }
}
