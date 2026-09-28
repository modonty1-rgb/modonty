"use server";

import { db } from "@/lib/db";
import { linkedWhere, mediaUsedWhere, mediaUnusedWhere } from "@/lib/media/usage-where";
import { getMediaLinks } from "@/lib/media/media-links";

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
  mediaTypesRaw: Array<{ type: string | null; _count: { _all: number } }>
) {
  return mediaTypesRaw.reduce(
    (acc, item) => {
      const type = item.type || "NULL";
      const n = item._count._all;
      if (type === "GENERAL") acc.GENERAL += n;
      else if (type === "LOGO") acc.LOGO += n;
      else if (type === "OGIMAGE") acc.OGIMAGE += n;
      else if (type === "CLIENT_MINI") acc.CLIENT_MINI += n;
      else if (type === "POST") acc.POST += n;
      else if (type === "TWITTER_IMAGE") acc.TWITTER_IMAGE += n;
      else if (type === "NULL") {
        acc.NULL = (acc.NULL || 0) + n;
      }
      return acc;
    },
    {
      GENERAL: 0,
      LOGO: 0,
      OGIMAGE: 0,
      CLIENT_MINI: 0,
      POST: 0,
      TWITTER_IMAGE: 0,
      NULL: 0,
    }
  );
}

// Match /media list default filter — exclude PLATFORM scope AND GALLERY images (client
// galleries live in their own /client-galleries route now, not the general library).
const SCOPE_FILTER = { scope: { not: "PLATFORM" }, type: { not: "GALLERY" } } as const;

export async function getMediaStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const links = await getMediaLinks();

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
      asHeroImages,
    ] = await Promise.all([
      // Total media (matches /media filter universe — excludes PLATFORM scope)
      db.media.count({ where: SCOPE_FILTER }),
      // Images
      db.media.count({ where: { ...SCOPE_FILTER, mimeType: { startsWith: "image/" } } }),
      // Videos
      db.media.count({ where: { ...SCOPE_FILTER, mimeType: { startsWith: "video/" } } }),
      // Used (linked via featured, logo, OR hero — single source of truth)
      db.media.count({ where: { AND: [SCOPE_FILTER, mediaUsedWhere(links)] } }),
      // Unused (not linked via featured, logo, NOR hero — single source of truth)
      db.media.count({ where: { AND: [SCOPE_FILTER, mediaUnusedWhere(links)] } }),
      // Created this month
      db.media.count({ where: { ...SCOPE_FILTER, createdAt: { gte: startOfMonth } } }),
      // Total file size
      db.media.aggregate({ where: SCOPE_FILTER, _sum: { fileSize: true } }),
      // Image type breakdown
      db.media.groupBy({
        by: ["mimeType"],
        where: { ...SCOPE_FILTER, mimeType: { startsWith: "image/" } },
        _count: { _all: true },
      }),
      // Media type breakdown (GENERAL, LOGO, OGIMAGE, etc.)
      db.media.groupBy({ by: ["type"], where: SCOPE_FILTER, _count: { _all: true } }),
      // Detailed usage breakdown: Media featured in an article or inside its gallery
      db.media.count({
        where: {
          AND: [
            SCOPE_FILTER,
            linkedWhere(links, "featuredArticles", "articleGallery"),
          ],
        },
      }),
      // Detailed usage breakdown: Media used as client logos
      db.media.count({ where: { AND: [SCOPE_FILTER, linkedWhere(links, "logoClients")] } }),
      // Detailed usage breakdown: Media used as hero images
      db.media.count({ where: { AND: [SCOPE_FILTER, linkedWhere(links, "heroImageClients")] } }),
    ]);

    const imageTypeCounts = normalizeImageTypeCounts(imageTypesRaw);
    const mediaTypeCounts = normalizeMediaTypeCounts(mediaTypesRaw);

    // Union of every usage type — one media can be used in several ways. Uses the shared
    // clause so it cannot drift from the filter or the delete guard.
    const totalUsedUnique = used;

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
      usageBreakdown: {
        inArticles,
        asLogos,
        asHeroImages,
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
        CLIENT_MINI: 0,
        POST: 0,
        TWITTER_IMAGE: 0,
      },
      usageBreakdown: {
        inArticles: 0,
        asLogos: 0,
        asHeroImages: 0,
        totalUsed: 0,
        unused: 0,
      },
    };
  }
}
