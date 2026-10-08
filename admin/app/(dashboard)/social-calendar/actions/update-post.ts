"use server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { monthParamOfDate, parseDayInput } from "../helpers/dates";
import { firstZodError } from "../helpers/first-zod-error";
import { updatePostSchema, type UpdatePostInput } from "../helpers/post-schema";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { ActionResultWith } from "./action-result";

/**
 * تعديل البريف + نقل التاريخ في حفظ واحد — كنموذج التعديل القديم الذي يكتب `month` الجديد مع
 * الحقول (`EntryPageForm.tsx:423-424`). الفرق: التاريخ يوم كامل بسنة، لا شهر بلا سنة.
 * لا يلمس الحالة: التعديل مسموح في كل حالة كالقديم.
 */
export async function updateSocialPost(
  input: UpdatePostInput,
): Promise<ActionResultWith<{ monthParam: string; moved: boolean }>> {
  const actor = await requireSocialActor("editBrief");
  if ("error" in actor) return { success: false, error: actor.error };

  const parsed = updatePostSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) };
  const data = parsed.data;

  const scheduledFor = parseDayInput(data.date);
  if (!scheduledFor) return { success: false, error: "تاريخ غير صالح" };

  try {
    const existing = await db.socialPost.findUnique({
      where: { id: data.postId },
      select: { id: true, scheduledFor: true, client: { select: { name: true } } },
    });
    if (!existing) return { success: false, error: "المنشور غير موجود" };

    await db.socialPost.update({
      where: { id: existing.id },
      data: {
        scheduledFor,
        idea: data.idea,
        format: data.format,
        funnelStages: data.funnelStages,
        channels: data.channels,
        text: data.text,
        hook: data.hook,
        cta: data.cta,
        scriptUrl: data.scriptUrl,
        voiceTone: data.voiceTone,
        inspiration: data.inspiration,
        notes: data.notes,
      },
    });

    const moved = existing.scheduledFor.getTime() !== scheduledFor.getTime();
    await logAction("socialPost.update", {
      entity: "SocialPost",
      entityId: existing.id,
      summary: `${existing.client.name}: ${data.idea}`,
      metadata: moved
        ? { movedFrom: existing.scheduledFor.toISOString().slice(0, 10), movedTo: scheduledFor.toISOString().slice(0, 10) }
        : null,
    });
    revalidateSocialCalendar();

    return { success: true, monthParam: monthParamOfDate(scheduledFor), moved };
  } catch (error) {
    console.error("[social-calendar] updateSocialPost failed", error);
    return { success: false, error: "حدث خطأ عند التعديل" };
  }
}
