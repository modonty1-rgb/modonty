"use server";

import { db } from "@/lib/db";
import { streamUrls } from "@modonty/shared/lib/bunny-stream";

import { firstZodError } from "../helpers/first-zod-error";
import { videoAssetSchema } from "../helpers/post-schema";
import { ASSETS_LOCKED_STATUSES } from "../helpers/post-transitions";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { SocialAssetRow } from "../helpers/queries";
import type { ActionResultWith } from "./action-result";

/**
 * بعد أن ينتهي رفع tus: يُسجَّل الفيديو أصلاً للمنشور.
 *
 * `url` = ملفّ MP4 من Bunny Stream (للمعاينة والتحميل في صفحتَي الإنتاج والنشر)، و`playbackUrl`
 * = HLS. ملاحظة: Bunny يرمّز الفيديو بعد الرفع، فقد لا يعمل المشغّل لدقائق في البداية.
 */
export async function addSocialVideoAsset(input: {
  postId: string;
  videoId: string;
  label: string;
  bytes: number;
  width: number;
  height: number;
}): Promise<ActionResultWith<{ asset: SocialAssetRow }>> {
  const actor = await requireSocialActor("produce");
  if ("error" in actor) return { success: false, error: actor.error };

  const parsed = videoAssetSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) };
  const data = parsed.data;

  try {
    const post = await db.socialPost.findUnique({ where: { id: data.postId }, select: { id: true, status: true } });
    if (!post) return { success: false, error: "المنشور غير موجود" };
    if (ASSETS_LOCKED_STATUSES.includes(post.status)) {
      return { success: false, error: "الإبداع مقفل بعد الموافقة" };
    }

    const urls = streamUrls(data.videoId);
    const order = await db.socialPostAsset.count({ where: { postId: post.id } });
    const asset = await db.socialPostAsset.create({
      data: {
        postId: post.id,
        kind: "VIDEO",
        url: urls.mp4Url,
        playbackUrl: urls.playbackUrl,
        bunnyVideoId: data.videoId,
        label: data.label.trim() || null,
        bytes: data.bytes || null,
        width: data.width || null,
        height: data.height || null,
        order,
        uploadedById: actor.staffId,
      },
      select: { id: true, kind: true, url: true, label: true, width: true, height: true, bytes: true, bunnyVideoId: true },
    });
    revalidateSocialCalendar();
    return { success: true, asset };
  } catch (error) {
    console.error("[social-calendar] addSocialVideoAsset failed", error);
    return { success: false, error: "تعذّر حفظ الفيديو بعد رفعه" };
  }
}
