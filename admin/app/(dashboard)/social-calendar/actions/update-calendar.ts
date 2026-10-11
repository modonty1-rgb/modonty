"use server";

import { z } from "zod";
import { SocialCalendarKind } from "@prisma/client";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { calendarLabel, CALENDAR_LABEL_SELECT } from "../helpers/calendar-label";
import { firstZodError } from "../helpers/first-zod-error";
import { objectIdSchema } from "../helpers/post-schema";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import { upsertPostTask } from "../helpers/sync-post-task";
import type { ActionResult } from "./action-result";

const schema = z.object({
  calendarId: objectIdSchema,
  kind: z.nativeEnum(SocialCalendarKind),
  /** الكاليندر غير المربوط بعميل فقط — المربوط باسم عميله. */
  name: z.string().trim().min(1, "اكتب اسم الكاليندر").max(120, "الاسم أطول من ١٢٠ حرف").optional(),
  designerId: objectIdSchema.nullable(),
});

/**
 * إعدادات الكرت: النوع · المصمم · الاسم (لغير المربوط بعميل). الحفظ يمسح «محتاج مراجعة».
 *
 * المصمم على الكرت لا على كل منشور (خالد ١١ أكتوبر ٢٠٢٦). تغييره ينقل إليه المنشورات التي لم
 * يُعتمد تصميمها بعد (قيد الإنتاج · جاهز للمراجعة) وتاسكاتها؛ ما اعتُمد يبقى باسم من صمّمه.
 */
export async function updateSocialCalendar(input: z.input<typeof schema>): Promise<ActionResult> {
  const actor = await requireSocialActor("editBrief");
  if ("error" in actor) return { success: false, error: actor.error };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) };
  const { calendarId, kind, name, designerId } = parsed.data;

  try {
    const existing = await db.socialCalendar.findUnique({
      where: { id: calendarId },
      select: { id: true, clientId: true, designerId: true, ...CALENDAR_LABEL_SELECT },
    });
    if (!existing) return { success: false, error: "الكاليندر غير موجود" };

    const calendar = await db.socialCalendar.update({
      where: { id: calendarId },
      data: { kind, designerId, reviewNote: null, ...(name && !existing.clientId ? { name } : {}) },
      select: CALENDAR_LABEL_SELECT,
    });
    const label = calendarLabel(calendar);

    if ((existing.designerId ?? null) !== designerId) {
      const open = await db.socialPost.findMany({
        where: {
          calendarId,
          status: { in: ["IN_PRODUCTION", "READY_FOR_REVIEW"] },
          OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
        },
        select: {
          id: true,
          calendarId: true,
          idea: true,
          scheduledFor: true,
          format: true,
          funnelStages: true,
          channels: true,
          createdById: true,
          creativeAssigneeId: true,
        },
      });
      for (const post of open) {
        await db.socialPost.update({ where: { id: post.id }, data: { creativeAssigneeId: designerId } });
        await upsertPostTask({ ...post, creativeAssigneeId: designerId }, label, actor.staffId);
      }
    }

    await logAction("socialCalendar.update", { entity: "SocialCalendar", entityId: calendarId, summary: label });
    revalidateSocialCalendar();
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] updateSocialCalendar failed", error);
    return { success: false, error: "حدث خطأ عند حفظ الكاليندر" };
  }
}
