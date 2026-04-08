import { db } from "@/lib/db";
import { MediaType } from "@prisma/client";

export interface MediaWithStats {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  title: string | null;
  type: MediaType;
  cloudinaryPublicId: string | null;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export async function getClientMedia(
  clientId: string,
  type?: MediaType
): Promise<MediaWithStats[]> {
  const media = await db.media.findMany({
    where: {
      clientId,
      ...(type && { type }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const mediaWithStats = await Promise.all(
    media.map(async (m) => {
      const usageCount = await getMediaUsageCount(m.id);
      return {
        ...m,
        usageCount,
      };
    })
  );

  return mediaWithStats;
}

export async function getMediaUsageCount(mediaId: string): Promise<number> {
  const [articleCount, logoCount, heroImageCount] = await Promise.all([
    db.article.count({
      where: { featuredImageId: mediaId },
    }),
    db.client.count({
      where: { logoMediaId: mediaId },
    }),
    db.client.count({
      where: { heroImageMediaId: mediaId },
    }),
  ]);

  return articleCount + logoCount + heroImageCount;
}

export async function getClientBrandingMedia(clientId: string) {
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      logoMedia: true,
      heroImageMedia: true,
    },
  });

  return {
    logo: client?.logoMedia || null,
    heroImage: client?.heroImageMedia || null,
  };
}

export async function getMediaStats(clientId: string) {
  const [totalMedia, totalSize, mediaByType] = await Promise.all([
    db.media.count({
      where: { clientId },
    }),
    db.media.aggregate({
      where: { clientId },
      _sum: {
        fileSize: true,
      },
    }),
    db.media.groupBy({
      by: ["type"],
      where: { clientId },
      _count: {
        type: true,
      },
    }),
  ]);

  return {
    totalMedia,
    totalSize: totalSize._sum.fileSize || 0,
    byType: mediaByType.map((t) => ({
      type: t.type,
      count: t._count.type,
    })),
  };
}
