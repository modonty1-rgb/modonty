"use server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { SOCIAL_POST_NOT_ARCHIVED } from "../helpers/not-archived";
import { objectIdSchema } from "../helpers/post-schema";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { ActionResult } from "./action-result";

/** أرشفة ناعمة: يختفي من الجدول ويُحفظ في الأرشيف، ويُسترجع في أي وقت (القديم `archiveEntry`). */
export async function archiveSocialPost(postId: string): Promise<ActionResult> {
  const actor = await requireSocialActor("archive");
  if ("error" in actor) return { success: false, error: actor.error };
  if (!objectIdSchema.safeParse(postId).success) return { success: false, error: "معرّف غير صالح" };

  try {
    const post = await db.socialPost.findUnique({
      where: { id: postId },
      select: { id: true, idea: true, client: { select: { name: true } } },
    });
    if (!post) return { success: false, error: "المنشور غير موجود" };

    const res = await db.socialPost.updateMany({
      where: { id: post.id, ...SOCIAL_POST_NOT_ARCHIVED },
      data: { archivedAt: new Date() },
    });
    if (res.count === 0) return { success: false, error: "المنشور مؤرشف أصلاً" };

    await logAction("socialPost.archive", {
      entity: "SocialPost",
      entityId: post.id,
      summary: `${post.client.name}: ${post.idea}`,
    });
    revalidateSocialCalendar();
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] archiveSocialPost failed", error);
    return { success: false, error: "حدث خطأ عند الأرشفة" };
  }
}
