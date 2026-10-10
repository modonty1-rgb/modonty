"use server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { objectIdSchema } from "../helpers/post-schema";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { ActionResult } from "./action-result";

/** استرجاع من الأرشيف — يعود لنفس يومه وشهره، بنفس حالته (القديم `unarchiveEntry`). */
export async function restoreSocialPost(postId: string): Promise<ActionResult> {
  const actor = await requireSocialActor("archive");
  if ("error" in actor) return { success: false, error: actor.error };
  if (!objectIdSchema.safeParse(postId).success) return { success: false, error: "معرّف غير صالح" };

  try {
    const post = await db.socialPost.findUnique({
      where: { id: postId },
      select: { id: true, idea: true, archivedAt: true, client: { select: { name: true } } },
    });
    if (!post) return { success: false, error: "المنشور غير موجود" };
    if (!post.archivedAt) return { success: false, error: "المنشور ليس في الأرشيف" };

    await db.socialPost.update({ where: { id: post.id }, data: { archivedAt: null } });

    await logAction("socialPost.restore", {
      entity: "SocialPost",
      entityId: post.id,
      summary: `${post.client.name}: ${post.idea}`,
    });
    revalidateSocialCalendar();
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] restoreSocialPost failed", error);
    return { success: false, error: "حدث خطأ عند الاسترجاع" };
  }
}
