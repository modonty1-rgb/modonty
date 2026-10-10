"use server";

import { after } from "next/server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { monthParamOfDate, parseDayInput } from "../helpers/dates";
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
    const client = await db.client.findUnique({ where: { id: data.clientId }, select: { id: true, name: true } });
    if (!client) return { success: false, error: "العميل غير موجود" };

    const now = new Date();
    const post = await db.socialPost.create({
      data: {
        clientId: client.id,
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
        createdById: actor.staffId,
      },
      select: {
        id: true,
        clientId: true,
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
      summary: `${client.name}: ${post.idea}`,
    });
    revalidateSocialCalendar();

    after(() =>
      notifySocialPostEvent({
        event: "created",
        post,
        clientName: client.name,
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
