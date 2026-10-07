"use server";

import { db } from "@/lib/db";
import { MediaScope } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface OrphanStats {
  unusedMedia: number;
  expiredOtps: number;
  total: number;
}

export async function getOrphanStats(): Promise<OrphanStats> {
  const [articleFeaturedIds, galleryMediaIds, clientLogoIds, clientHeroIds, expiredOtps] =
    await Promise.all([
      db.article.findMany({ where: { featuredImageId: { not: null } }, select: { featuredImageId: true } }),
      db.articleMedia.findMany({ select: { mediaId: true } }),
      db.client.findMany({ where: { logoMediaId: { not: null } }, select: { logoMediaId: true } }),
      db.client.findMany({ where: { heroImageMediaId: { not: null } }, select: { heroImageMediaId: true } }),
      db.slugChangeOtp.count({ where: { expiresAt: { lt: new Date() } } }),
    ]);

  const usedMediaIds = new Set([
    ...articleFeaturedIds.map((a) => a.featuredImageId!),
    ...galleryMediaIds.map((m) => m.mediaId),
    ...clientLogoIds.map((c) => c.logoMediaId!),
    ...clientHeroIds.map((c) => c.heroImageMediaId!),
  ]);

  const [totalNonPlatform, referencedCount] = await Promise.all([
    db.media.count({ where: { scope: { not: MediaScope.PLATFORM } } }),
    db.media.count({ where: { id: { in: Array.from(usedMediaIds) }, scope: { not: MediaScope.PLATFORM } } }),
  ]);

  const unusedMedia = totalNonPlatform - referencedCount;
  return { unusedMedia, expiredOtps, total: unusedMedia + expiredOtps };
}

export async function cleanExpiredOtps(): Promise<{ deleted: number }> {
  const result = await db.slugChangeOtp.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  revalidatePath("/database");
  return { deleted: result.count };
}
