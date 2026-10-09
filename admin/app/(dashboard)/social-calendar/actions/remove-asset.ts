"use server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { deleteFromBunny } from "@modonty/shared/lib/bunny";
import { deleteStreamVideo } from "@modonty/shared/lib/bunny-stream";

import { objectIdSchema } from "../helpers/post-schema";
import { ASSETS_LOCKED_STATUSES, nextSocialStatus } from "../helpers/post-transitions";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { ActionResult } from "./action-result";

/**
 * حذف أصل — من صفحة الإنتاج أو من المعرض (القديم `deleteAsset` `entries.ts:347-386`).
 *
 * - مرفوض بعد الموافقة («جاهز للنشر» / «تم النشر») — نفس رسالة القديم.
 * - يحذف الملف من Bunny (تخزين الصور أو مكتبة الفيديو). خارج الإنتاج الحذف مقصور على `_dev/`
 *   بالتصميم (`shared/lib/bunny.ts`) — فشله يُسجَّل ولا يمنع إزالة الصفّ، كالقديم.
 * - حذف آخر أصل في «جاهز للمراجعة» يعيد المنشور لـ«قيد الإنتاج» تلقائياً (`entries.ts:376-378`).
 */
export async function removeSocialAsset(assetId: string): Promise<ActionResult> {
  const actor = await requireSocialActor("produce");
  if ("error" in actor) return { success: false, error: actor.error };
  if (!objectIdSchema.safeParse(assetId).success) return { success: false, error: "معرّف غير صالح" };

  try {
    const asset = await db.socialPostAsset.findUnique({
      where: { id: assetId },
      select: {
        id: true,
        path: true,
        bunnyVideoId: true,
        label: true,
        post: { select: { id: true, status: true, idea: true, client: { select: { name: true } } } },
      },
    });
    if (!asset) return { success: false, error: "الملف غير موجود" };
    const { post } = asset;

    if (ASSETS_LOCKED_STATUSES.includes(post.status)) {
      return {
        success: false,
        error: "لا يمكن حذف الإبداع في هذه المرحلة. ارفض الكريتيف أولاً للرجوع لمرحلة الإنتاج.",
      };
    }

    try {
      if (asset.path) await deleteFromBunny("clients", asset.path);
      if (asset.bunnyVideoId) await deleteStreamVideo(asset.bunnyVideoId);
    } catch (error) {
      console.error("[social-calendar] Bunny delete failed — row removed anyway", { assetId, error });
    }

    await db.socialPostAsset.delete({ where: { id: asset.id } });

    const remaining = await db.socialPostAsset.count({ where: { postId: post.id } });
    let statusChange: { from: string; to: string } | null = null;
    if (remaining === 0) {
      const to = nextSocialStatus(post.status, "assetsEmptied");
      if (to) {
        const res = await db.socialPost.updateMany({
          where: { id: post.id, status: post.status },
          data: { status: to, statusUpdatedAt: new Date() },
        });
        if (res.count > 0) statusChange = { from: post.status, to };
      }
    }

    await logAction("socialPost.assetDelete", {
      entity: "SocialPost",
      entityId: post.id,
      summary: `${post.client.name}: ${post.idea}${asset.label ? ` — ${asset.label}` : ""}`,
      metadata: statusChange,
    });
    revalidateSocialCalendar();
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] removeSocialAsset failed", error);
    return { success: false, error: "حدث خطأ غير متوقع عند الحذف" };
  }
}
