"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getMediaUsage(id: string, clientId?: string) {
  try {
    const where: Prisma.MediaWhereInput = { id };
    if (clientId) {
      where.clientId = clientId;
    }

    const media = await db.media.findFirst({
      where,
      include: {
        featuredArticles: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            clientId: true,
          },
        },
        // The gallery inside an article. Missing here until 2026-07-13, which is how a
        // gallery image of a PUBLISHED article could be reported unused and deleted.
        articleGallery: {
          select: {
            article: { select: { id: true, title: true, slug: true, status: true, clientId: true } },
          },
        },
        logoClients: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        heroImageClients: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!media) {
      return { success: false, error: "Media not found" };
    }

    const inGallery = media.articleGallery.map((g) => g.article);

    const usage = {
      featuredIn: media.featuredArticles,
      inArticle: inGallery,
      totalUsage: media.featuredArticles.length + inGallery.length,
      // The image's own type + owning client — needed to protect client-owned GALLERY /
      // CLIENT_MINI images (live on the client page with no back-relation) from deletion.
      mediaType: media.type,
      ownerClientId: media.clientId,
      // حالة الريل ومعرّف الفيديو على بني. الحارس كان يجهل الريلز تماماً، فصفّ ريل منشور
      // يُحذف من شاشة الوسائط ويبقى الفيديو عند بني بلا مالك — مساحة مدفوعة ورابط عامّ
      // مكسور. نفس صنف فقدان البيانات الذي عالجه حارس معرض المقال أعلاه.
      inReels: media.inReels,
      reelStatus: media.reelStatus,
      bunnyVideoId: media.bunnyVideoId,
      clientUsage: {
        logoClients: media.logoClients,
        heroImageClients: media.heroImageClients,
      },
    };

    return { success: true, usage };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get media usage";
    return { success: false, error: message };
  }
}
