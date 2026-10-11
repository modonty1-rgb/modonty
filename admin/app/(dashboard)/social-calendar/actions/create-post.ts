"use server";

import { after } from "next/server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { monthParamOfDate, parseDayInput } from "../helpers/dates";
import { calendarLabel, CALENDAR_LABEL_SELECT } from "../helpers/calendar-label";
import { firstZodError } from "../helpers/first-zod-error";
import { notifySocialPostEvent } from "../helpers/notify-post-event";
import { createPostSchema, type CreatePostInput } from "../helpers/post-schema";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { ActionResultWith } from "./action-result";

/**
 * كاتب المحتوى ينشئ المنشور → «قيد الإنتاج» ويُختم `productionStartedAt` (القديم `entries.ts:205-224`).
 * تيليجرام اختياري بقيمة الـcheckbox، كالقديم.
 */
export async function createSocialPost(
  input: CreatePostInput,
): Promise<ActionResultWith<{ postId: string; monthParam: string }>> {
  const actor = await requireSocialActor("editBrief");
  if ("error" in actor) return { success: false, error: actor.error };

  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) };
  const data = parsed.data;

  const scheduledFor = parseDayInput(data.date);
  if (!scheduledFor) return { success: false, error: "تاريخ غير صالح" };

  try {
    const calendar = await db.socialCalendar.findUnique({
      where: { id: data.calendarId },
      select: { id: true, designerId: true, archivedAt: true, ...CALENDAR_LABEL_SELECT },
    });
    if (!calendar || calendar.archivedAt) return { success: false, error: "الكاليندر غير موجود" };
    const name = calendarLabel(calendar);

    const now = new Date();
    const post = await db.socialPost.create({
      data: {
        calendarId: calendar.id,
        scheduledFor,
        status: "IN_PRODUCTION",
        statusUpdatedAt: now,
        productionStartedAt: now,
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
        // مصمم الكاليندر — يُختار مرّة على الكرت لا على كل منشور (خالد ١١ أكتوبر ٢٠٢٦).
        creativeAssigneeId: calendar.designerId,
        createdById: actor.staffId,
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

    await logAction("socialPost.create", {
      entity: "SocialPost",
      entityId: post.id,
      summary: `${name}: ${post.idea}`,
    });
    revalidateSocialCalendar();

    after(() =>
      notifySocialPostEvent({
        event: "created",
        post,
        clientName: name,
        actorId: actor.staffId,
        telegram: data.notifyTelegram,
      }),
    );

    return { success: true, postId: post.id, monthParam: monthParamOfDate(post.scheduledFor) };
  } catch (error) {
    console.error("[social-calendar] createSocialPost failed", error);
    return { success: false, error: "حدث خطأ عند الإضافة" };
  }
}
