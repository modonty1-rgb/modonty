import { db } from "@/lib/db";
import { MediaType } from "@prisma/client";

export interface MediaUsageRef {
  type: "article" | "logo" | "heroImage";
  label: string;
}

export interface MediaWithStats {
  id: string;
  filename: string;
  url: string;
  /** Required key (value may be null) — omitting it narrowed the Bunny copy away. */
  bunnyUrl: string | null;
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
  usageRefs: MediaUsageRef[];
}

/**
 * What this screen is NOT: the client's gallery, and not their reels either.
 *
 * Khalid (2026-08-05): "الـtab هذي المفروض ما تعرض الصور تبعت الـgallery — المنطقة هذي
 * تخص الحاجات اللي بتجي من الـadmin." Those two have owners of their own now (معرض الصور ·
 * الريلز · الفيديوهات), and showing the same file in two places means the client deletes
 * it here and wonders why their page changed.
 *
 * What is left is exactly what this screen is for: files that reached the client from
 * Modonty's side — article covers, the logo, the hero image, anything the admin attached.
 *
 * Both exclusions are written as `NOT` on the positive value on purpose. In MongoDB an
 * absent key matches neither the value nor its negation, and rows written before these
 * fields existed have no key at all — `NOT` keeps them visible, which is the safe way to
 * be wrong. The reverse test would hide a client's whole library.
 */
export async function getClientMedia(
  clientId: string,
  type?: MediaType
): Promise<MediaWithStats[]> {
  const media = await db.media.findMany({
    where: {
      clientId,
      ...(type ? { type } : { NOT: [{ type: MediaType.GALLERY }, { inReels: true }] }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const mediaWithStats = await Promise.all(
    media.map(async (m) => {
      const usageRefs = await getMediaUsageDetails(m.id);
      return {
        ...m,
        usageCount: usageRefs.length,
        usageRefs,
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

/** Returns a list of WHERE this media is used (article titles + branding slots). */
export async function getMediaUsageDetails(mediaId: string): Promise<MediaUsageRef[]> {
  const [articles, asLogo, asHero] = await Promise.all([
    db.article.findMany({
      where: { featuredImageId: mediaId },
      select: { title: true },
    }),
    db.client.findMany({
      where: { logoMediaId: mediaId },
      select: { name: true },
    }),
    db.client.findMany({
      where: { heroImageMediaId: mediaId },
      select: { name: true },
    }),
  ]);

  const refs: MediaUsageRef[] = [];
  for (const a of articles) refs.push({ type: "article", label: a.title });
  for (const c of asLogo) refs.push({ type: "logo", label: `شعار ${c.name}` });
  for (const c of asHero) refs.push({ type: "heroImage", label: `صورة الغلاف لـ ${c.name}` });
  return refs;
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
