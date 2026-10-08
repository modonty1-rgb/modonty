"use server";

import { after } from "next/server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { STATUS_LABEL } from "../helpers/social-labels";
import { notifySocialPostEvent } from "../helpers/notify-post-event";
import { objectIdSchema } from "../helpers/post-schema";
import { nextSocialStatus } from "../helpers/post-transitions";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import { TRANSITION_SELECT } from "../helpers/transition-select";
import type { ActionResult } from "./action-result";

/**
 * المصمم: «جاهز للمراجعة» — يشترط أصلاً مرفوعاً واحداً على الأقل (`ProductionForm.tsx:208`)،
 * ويختم `productionCompletedAt` (`entries.ts:259`)، ثم تيليجرام تلقائي.
 */
export async function markSocialPostReady(postId: string): Promise<ActionResult> {
  const actor = await requireSocialActor("produce");
  if ("error" in actor) return { success: false, error: actor.error };
  if (!objectIdSchema.safeParse(postId).success) return { success: false, error: "معرّف غير صالح" };

  try {
    const post = await db.socialPost.findUnique({ where: { id: postId }, select: TRANSITION_SELECT });
    if (!post) return { success: false, error: "المنشور غير موجود" };

    const to = nextSocialStatus(post.status, "markReady");
    if (!to) return { success: false, error: `لا يمكن الإرسال للمراجعة من «${STATUS_LABEL[post.status]}»` };
    if (post._count.assets === 0) return { success: false, error: "ارفع ملف إبداع واحداً على الأقل أولاً" };

    const now = new Date();
    // شرط الحالة داخل الكتابة نفسها: لو غيّرها زميل بين القراءة والكتابة، لا نكتب فوقه.
    const res = await db.socialPost.updateMany({
      where: { id: post.id, status: post.status },
      data: { status: to, statusUpdatedAt: now, productionCompletedAt: now },
    });
    if (res.count === 0) return { success: false, error: "تغيّرت حالة المنشور — حدّث الصفحة" };

    await logAction("socialPost.transition", {
      entity: "SocialPost",
      entityId: post.id,
      summary: `${post.client.name}: ${post.idea}`,
      metadata: { from: post.status, to },
    });
    revalidateSocialCalendar();

    after(() =>
      notifySocialPostEvent({
        event: "readyForReview",
        post,
        clientName: post.client.name,
        actorId: actor.staffId,
        assetCount: post._count.assets,
      }),
    );
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] markSocialPostReady failed", error);
    return { success: false, error: "حدث خطأ عند تحديث الحالة" };
  }
}
