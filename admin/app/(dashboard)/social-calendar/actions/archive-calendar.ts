"use server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { calendarLabel, CALENDAR_LABEL_SELECT } from "../helpers/calendar-label";
import { objectIdSchema } from "../helpers/post-schema";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { ActionResult } from "./action-result";

/**
 * أرشفة الكاليندر لا حذفه (خالد ١١ أكتوبر ٢٠٢٦: «الأرشفة، بلاش الحذف»): يختفي كرته من قسمه
 * ويبقى بمنشوراته، ويُسترجع من «المؤرشفة» أسفل القسم.
 */
async function setArchived(calendarId: string, archived: boolean): Promise<ActionResult> {
  const actor = await requireSocialActor("archive");
  if ("error" in actor) return { success: false, error: actor.error };
  if (!objectIdSchema.safeParse(calendarId).success) return { success: false, error: "معرّف غير صالح" };

  try {
    const calendar = await db.socialCalendar.update({
      where: { id: calendarId },
      data: { archivedAt: archived ? new Date() : null },
      select: CALENDAR_LABEL_SELECT,
    });
    await logAction(archived ? "socialCalendar.archive" : "socialCalendar.restore", {
      entity: "SocialCalendar",
      entityId: calendarId,
      summary: calendarLabel(calendar),
    });
    revalidateSocialCalendar();
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] setArchived failed", error);
    return { success: false, error: archived ? "حدث خطأ عند الأرشفة" : "حدث خطأ عند الاسترجاع" };
  }
}

export async function archiveSocialCalendar(calendarId: string): Promise<ActionResult> {
  return setArchived(calendarId, true);
}

export async function restoreSocialCalendar(calendarId: string): Promise<ActionResult> {
  return setArchived(calendarId, false);
}
