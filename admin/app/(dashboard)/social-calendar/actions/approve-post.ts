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
 * كاتب المحتوى يمنح الموافقة → «جاهز للنشر» (القديم `CalendarTable.tsx:262-278`).
 * الموافقة تمسح ملاحظة الرفض السابقة (PRD §٥.١)، وتيليجرام تلقائي للميديا باير.
 */
export async function approveSocialPost(postId: string): Promise<ActionResult> {
  const actor = await requireSocialActor("review");
  if ("error" in actor) return { success: false, error: actor.error };
  if (!objectIdSchema.safeParse(postId).success) return { success: false, error: "معرّف غير صالح" };

  try {
    const post = await db.socialPost.findUnique({ where: { id: postId }, select: TRANSITION_SELECT });
    if (!post) return { success: false, error: "المنشور غير موجود" };

    const to = nextSocialStatus(post.status, "approve");
    if (!to) return { success: false, error: `لا يمكن الموافقة من «${STATUS_LABEL[post.status]}»` };

    const res = await db.socialPost.updateMany({
      where: { id: post.id, status: post.status },
      data: { status: to, statusUpdatedAt: new Date(), rejectionNote: null },
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
      notifySocialPostEvent({ event: "approved", post, clientName: post.client.name, actorId: actor.staffId }),
    );
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] approveSocialPost failed", error);
    return { success: false, error: "حدث خطأ عند الموافقة" };
  }
}
