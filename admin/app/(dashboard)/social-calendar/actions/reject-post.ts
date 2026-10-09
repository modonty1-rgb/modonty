"use server";

import { after } from "next/server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { STATUS_LABEL } from "../helpers/social-labels";
import { firstZodError } from "../helpers/first-zod-error";
import { notifySocialPostEvent } from "../helpers/notify-post-event";
import { canSocial } from "../helpers/post-permissions";
import { rejectPostSchema } from "../helpers/post-schema";
import { nextSocialStatus } from "../helpers/post-transitions";
import { NO_PERMISSION_ERROR, requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import { TRANSITION_SELECT } from "../helpers/transition-select";
import type { ActionResult } from "./action-result";

/**
 * رفض الإبداع → يرجع «قيد الإنتاج» بملاحظة (القديم `rejectEntry` `entries.ts:325-344`).
 *
 * - من «جاهز للمراجعة»: كاتب المحتوى (صلاحية review). الملاحظة اختيارية كالقديم.
 * - من «جاهز للنشر»: الميديا باير يعيده (س٧ — جديد). الملاحظة إلزامية هنا: المنشور وافق عليه
 *   كاتبه، فإرجاعه بلا سبب يترك المصمم بلا ما يصلحه.
 *
 * `rejectionCount++` للتقارير، وتيليجرام تلقائي بالملاحظة (جديد — القديم لا يرسل).
 */
export async function rejectSocialPost(input: { postId: string; note: string }): Promise<ActionResult> {
  const actor = await requireSocialActor("view");
  if ("error" in actor) return { success: false, error: actor.error };

  const parsed = rejectPostSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) };
  const note = parsed.data.note.trim();

  try {
    const post = await db.socialPost.findUnique({ where: { id: parsed.data.postId }, select: TRANSITION_SELECT });
    if (!post) return { success: false, error: "المنشور غير موجود" };

    const to = nextSocialStatus(post.status, "reject");
    if (!to) return { success: false, error: `لا يمكن الرفض من «${STATUS_LABEL[post.status]}»` };

    const fromPublishStage = post.status === "READY_TO_PUBLISH";
    if (!canSocial(actor.role, fromPublishStage ? "publish" : "review")) {
      return { success: false, error: NO_PERMISSION_ERROR };
    }
    if (fromPublishStage && !note) return { success: false, error: "اكتب سبب الإرجاع للمصمم" };

    const res = await db.socialPost.updateMany({
      where: { id: post.id, status: post.status },
      data: {
        status: to,
        statusUpdatedAt: new Date(),
        rejectionNote: note || null,
        rejectionCount: { increment: 1 },
      },
    });
    if (res.count === 0) return { success: false, error: "تغيّرت حالة المنشور — حدّث الصفحة" };

    await logAction("socialPost.reject", {
      entity: "SocialPost",
      entityId: post.id,
      summary: `${post.client.name}: ${post.idea}`,
      metadata: { from: post.status, to, note: note || null },
    });
    revalidateSocialCalendar();

    after(() =>
      notifySocialPostEvent({
        event: "rejected",
        post,
        clientName: post.client.name,
        actorId: actor.staffId,
        note,
      }),
    );
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] rejectSocialPost failed", error);
    return { success: false, error: "حدث خطأ عند الرفض" };
  }
}
