"use server";

import { z } from "zod";
import { SocialCalendarKind } from "@prisma/client";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";

import { firstZodError } from "../helpers/first-zod-error";
import { objectIdSchema } from "../helpers/post-schema";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { ActionResultWith } from "./action-result";

const schema = z.object({
  kind: z.nativeEnum(SocialCalendarKind),
  name: z.string().trim().min(1, "اكتب اسم الكاليندر").max(120, "الاسم أطول من ١٢٠ حرف"),
  designerId: objectIdSchema.nullable(),
});

/**
 * «كاليندر جديد» من القائمة الجانبية — النوع يُختار هنا: محتوى أو سوشيال، لأيّ براند
 * (خالد ١١ أكتوبر ٢٠٢٦). كاليندر عميل مدونتي يفتحه تفعيله (`lib/orders/activate-from-order.ts`).
 */
export async function createSocialCalendar(input: z.input<typeof schema>): Promise<ActionResultWith<{ calendarId: string }>> {
  const actor = await requireSocialActor("editBrief");
  if ("error" in actor) return { success: false, error: actor.error };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) };

  try {
    const calendar = await db.socialCalendar.create({
      data: { kind: parsed.data.kind, name: parsed.data.name, designerId: parsed.data.designerId },
      select: { id: true },
    });
    await logAction("socialCalendar.create", { entity: "SocialCalendar", entityId: calendar.id, summary: parsed.data.name });
    revalidateSocialCalendar();
    return { success: true, calendarId: calendar.id };
  } catch (error) {
    console.error("[social-calendar] createSocialCalendar failed", error);
    return { success: false, error: "حدث خطأ عند إنشاء الكاليندر" };
  }
}
