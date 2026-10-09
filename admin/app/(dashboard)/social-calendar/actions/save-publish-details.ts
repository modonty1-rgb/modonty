"use server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { buildPublishData } from "../helpers/build-publish-data";
import { firstZodError } from "../helpers/first-zod-error";
import { publishDetailsSchema, type PublishDetailsInput } from "../helpers/post-schema";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { ActionResult } from "./action-result";

/**
 * الميديا باير: «حفظ بدون نشر» — وبعد النشر «حفظ التعديلات» (`PublishForm.tsx:99-112, 357`).
 * لا يغيّر الحالة. مسموح فقط في «جاهز للنشر» و«تم النشر»: صفحة النشر لا تُفتح قبلهما.
 */
export async function saveSocialPublishDetails(input: PublishDetailsInput): Promise<ActionResult> {
  const actor = await requireSocialActor("publish");
  if ("error" in actor) return { success: false, error: actor.error };

  const parsed = publishDetailsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) };

  try {
    const post = await db.socialPost.findUnique({
      where: { id: parsed.data.postId },
      select: { id: true, status: true, channels: true, idea: true, client: { select: { name: true } } },
    });
    if (!post) return { success: false, error: "المنشور غير موجود" };
    if (post.status !== "READY_TO_PUBLISH" && post.status !== "PUBLISHED") {
      return { success: false, error: "بيانات النشر تُحفظ بعد الموافقة على الإبداع" };
    }

    await db.socialPost.update({ where: { id: post.id }, data: buildPublishData(parsed.data, post.channels) });

    await logAction("socialPost.update", {
      entity: "SocialPost",
      entityId: post.id,
      summary: `بيانات النشر — ${post.client.name}: ${post.idea}`,
    });
    revalidateSocialCalendar();
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] saveSocialPublishDetails failed", error);
    return { success: false, error: "حدث خطأ عند الحفظ" };
  }
}
