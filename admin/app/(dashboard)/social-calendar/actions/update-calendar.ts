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
import { TASK_NOT_ARCHIVED } from "@/lib/tasks/not-archived";
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
    const oldLabel = calendarLabel(existing);

    const calendar = await db.socialCalendar.update({
      where: { id: calendarId },
      data: { kind, designerId, reviewNote: null, ...(name && !existing.clientId ? { name } : {}) },
      select: CALENDAR_LABEL_SELECT,
    });
    const label = calendarLabel(calendar);
    // Only the designer-reassignment path below can take the bulk shortcut — if the
    // calendar's own name changed too, every open post's task description embeds this
    // label and genuinely needs the per-post recompute `upsertPostTask` does.
    const labelChanged = label !== oldLabel;

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
      if (open.length) {
        // One update for every reassigned post, not one per post (N+1 found 15 Oct 2026).
        await db.socialPost.updateMany({
          where: { id: { in: open.map((p) => p.id) } },
          data: { creativeAssigneeId: designerId },
        });

        if (!labelChanged) {
          // Common case: only the designer changed. Most of these posts already have a
          // design task (created when the post was first made) — reassigning it is one
          // `updateMany`, not a per-post round-trip. Only a post with NO task yet needs
          // the full per-post `upsertPostTask` (it computes a queue position, which is
          // inherently sequential and rare here).
          const existingTasks = await db.task.findMany({
            where: { socialPostId: { in: open.map((p) => p.id) }, ...TASK_NOT_ARCHIVED },
            select: { id: true, socialPostId: true },
          });
          const postIdsWithTask = new Set(existingTasks.map((t) => t.socialPostId));

          if (existingTasks.length) {
            await db.task.updateMany({
              where: { id: { in: existingTasks.map((t) => t.id) } },
              data: { assigneeId: designerId },
            });
          }

          for (const post of open) {
            if (!postIdsWithTask.has(post.id)) {
              await upsertPostTask({ ...post, creativeAssigneeId: designerId }, label, actor.staffId);
            }
          }
        } else {
          // Rare: the calendar's own name changed in the same save, so every open post's
          // task description (it embeds the label) genuinely needs its own recompute —
          // back to the original per-post path, correctness over the batch shortcut.
          for (const post of open) {
            await upsertPostTask({ ...post, creativeAssigneeId: designerId }, label, actor.staffId);
          }
        }
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
