"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MediaType } from "@prisma/client";
import { messages } from "@/lib/messages";

export async function deleteMedia(mediaId: string, clientId: string) {
  try {
    const media = await db.media.findFirst({
      where: {
        id: mediaId,
        clientId,
      },
    });

    if (!media) {
      return { success: false, error: messages.error.notFound };
    }

    const usageCount = await db.article.count({
      where: { featuredImageId: mediaId },
    });

    if (usageCount > 0) {
      return {
        success: false,
        error: messages.error.conflict,
      };
    }

    // الريل لا يُحذف من شاشة الوسائط. هذا المسار كان يفحص المقالات وحدها، فصفّ ريل
    // منشور يُمحى من هنا: يختفي من مدونتي بلا علم أحد، ويبقى الفيديو عند بني بلا مالك.
    // مسار الريلز نفسه يؤرشف ما رآه الزائر ولا يحذفه (`reels-actions.ts`) — فهذا الباب
    // كان يلتفّ على ذلك القرار.
    // المؤرشف والمرفوض يمرّان: خرجا من الواجهة العامّة وقرارهما اتُّخذ.
    const REEL_LIVE_STATUSES: string[] = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "PUBLISHED"];
    if (media.inReels || (media.reelStatus && REEL_LIVE_STATUSES.includes(media.reelStatus))) {
      return {
        success: false,
        error: "هذا الوسيط ريل — امسحه من شاشة الريلز لا من هنا.",
      };
    }

    // فيديو بني ستريم يُخزَّن بمعرّفه، فحذف الصفّ وحده يتركه في المكتبة: مساحة مدفوعة
    // بلا مالك. أفضل جهد — لا يعطّل حذف الصفّ، كما في مسار الأدمن.
    if (media.bunnyVideoId) {
      try {
        const { deleteStreamVideo } = await import("@modonty/shared/lib/bunny-stream");
        await deleteStreamVideo(media.bunnyVideoId);
      } catch {
        // يُسجَّل ولا يُوقف: الصفّ يُحذف، والفيديو اليتيم يلتقطه فحص الصيانة.
        console.warn("Bunny Stream delete failed, continuing with DB deletion");
      }
    }

    await db.media.delete({
      where: { id: mediaId },
    });

    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    return { success: false, error: messages.error.serverError };
  }
}

export async function updateMediaMetadata(
  mediaId: string,
  clientId: string,
  data: {
    altText?: string;
    caption?: string;
    title?: string;
    description?: string;
  }
) {
  try {
    const media = await db.media.findFirst({
      where: {
        id: mediaId,
        clientId,
      },
    });

    if (!media) {
      return { success: false, error: messages.error.notFound };
    }

    await db.media.update({
      where: { id: mediaId },
      data: {
        ...(data.altText !== undefined && { altText: data.altText || null }),
        ...(data.caption !== undefined && { caption: data.caption || null }),
        ...(data.title !== undefined && { title: data.title || null }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
      },
    });

    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return { success: false, error: message };
  }
}

export async function setClientBrandingMedia(
  clientId: string,
  mediaType: "logo" | "heroImage",
  mediaId: string | null
) {
  try {
    const updateData: any = {};

    if (mediaType === "logo") {
      updateData.logoMediaId = mediaId;
    } else if (mediaType === "heroImage") {
      updateData.heroImageMediaId = mediaId;
    }

    await db.client.update({
      where: { id: clientId },
      data: updateData,
    });

    revalidatePath("/dashboard/media");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return { success: false, error: message };
  }
}
