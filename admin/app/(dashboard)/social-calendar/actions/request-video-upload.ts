"use server";

import { db } from "@/lib/db";
import { createTusTicket } from "@modonty/shared/lib/bunny-stream";

import { objectIdSchema } from "../helpers/post-schema";
import { ASSETS_LOCKED_STATUSES } from "../helpers/post-transitions";
import { requireSocialActor } from "../helpers/require-social-actor";
import type { ActionResultWith } from "./action-result";

export interface SocialVideoTicket {
  endpoint: string;
  libraryId: string;
  videoId: string;
  signature: string;
  expire: number;
}

/**
 * الفيديو لا يمرّ بسيرفرنا (PRD §٣.٤ المسار ب، س١٣): سقف Vercel لجسم الطلب ٤٫٥MB، والقديم
 * كان يدّعي ٥٠٠MB عبر route لم يُثبَت على Vercel. هنا نُنشئ الفيديو في Bunny Stream ونوقّع
 * رفعاً واحداً له، والمتصفّح يرفع مباشرة بـ tus — نفس طريق ريلز الكونسول.
 */
export async function requestSocialVideoUpload(
  postId: string,
  filename: string,
): Promise<ActionResultWith<{ ticket: SocialVideoTicket }>> {
  const actor = await requireSocialActor("produce");
  if ("error" in actor) return { success: false, error: actor.error };
  if (!objectIdSchema.safeParse(postId).success) return { success: false, error: "معرّف غير صالح" };

  try {
    const post = await db.socialPost.findUnique({
      where: { id: postId },
      select: { id: true, status: true, client: { select: { slug: true } } },
    });
    if (!post) return { success: false, error: "المنشور غير موجود" };
    if (ASSETS_LOCKED_STATUSES.includes(post.status)) {
      return { success: false, error: "الإبداع مقفل بعد الموافقة" };
    }

    const title = `social/${post.client.slug}/${post.id}/${String(filename ?? "").slice(0, 120) || "video"}`;
    const ticket = await createTusTicket(title);
    return { success: true, ticket };
  } catch (error) {
    console.error("[social-calendar] requestSocialVideoUpload failed", error);
    return { success: false, error: "تعذّر تجهيز رفع الفيديو — حاول مرة أخرى" };
  }
}
