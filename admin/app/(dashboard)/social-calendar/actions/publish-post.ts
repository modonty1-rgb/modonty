"use server";

import { after } from "next/server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { buildPublishData } from "../helpers/build-publish-data";
import { STATUS_LABEL } from "../helpers/social-labels";
import { firstZodError } from "../helpers/first-zod-error";
import { notifySocialPostEvent } from "../helpers/notify-post-event";
import { publishDetailsSchema, type PublishDetailsInput } from "../helpers/post-schema";
import { nextSocialStatus } from "../helpers/post-transitions";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import { TRANSITION_SELECT } from "../helpers/transition-select";
import type { ActionResult } from "./action-result";

/**
 * الميديا باير: «نشر» — يحفظ بيانات النشر ثم «تم النشر» ويختم `publishedAt` في كتابة واحدة
 * (القديم: حفظ ثم `updateStatus` في طلبين — `PublishForm.tsx:114-131`)، ثم تيليجرام تلقائي.
 */
export async function publishSocialPost(input: PublishDetailsInput): Promise<ActionResult> {
  const actor = await requireSocialActor("publish");
  if ("error" in actor) return { success: false, error: actor.error };

  const parsed = publishDetailsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) };

  try {
    const post = await db.socialPost.findUnique({ where: { id: parsed.data.postId }, select: TRANSITION_SELECT });
    if (!post) return { success: false, error: "المنشور غير موجود" };

    const to = nextSocialStatus(post.status, "publish");
    if (!to) return { success: false, error: `لا يمكن النشر من «${STATUS_LABEL[post.status]}»` };

    const now = new Date();
    const res = await db.socialPost.updateMany({
      where: { id: post.id, status: post.status },
      data: {
        ...buildPublishData(parsed.data, post.channels),
        status: to,
        statusUpdatedAt: now,
        publishedAt: now,
        publishedById: actor.staffId,
      },
    });
    if (res.count === 0) return { success: false, error: "تغيّرت حالة المنشور — حدّث الصفحة" };

    await logAction("socialPost.publish", {
      entity: "SocialPost",
      entityId: post.id,
      summary: `${post.client.name}: ${post.idea}`,
      metadata: { from: post.status, to },
    });
    revalidateSocialCalendar();

    after(() =>
      notifySocialPostEvent({ event: "published", post, clientName: post.client.name, actorId: actor.staffId }),
    );
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] publishSocialPost failed", error);
    return { success: false, error: "حدث خطأ عند النشر" };
  }
}
