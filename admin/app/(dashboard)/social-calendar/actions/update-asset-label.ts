"use server";

import { db } from "@/lib/db";

import { firstZodError } from "../helpers/first-zod-error";
import { assetLabelSchema } from "../helpers/post-schema";
import { ASSETS_LOCKED_STATUSES } from "../helpers/post-transitions";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { ActionResult } from "./action-result";

/** تسمية الأصل في صفحة الإنتاج — تُحفظ عند مغادرة الحقل، ومقفلة بعد الموافقة كبقية الأصول. */
export async function updateSocialAssetLabel(input: { assetId: string; label: string }): Promise<ActionResult> {
  const actor = await requireSocialActor("produce");
  if ("error" in actor) return { success: false, error: actor.error };

  const parsed = assetLabelSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) };

  try {
    const asset = await db.socialPostAsset.findUnique({
      where: { id: parsed.data.assetId },
      select: { id: true, post: { select: { status: true } } },
    });
    if (!asset) return { success: false, error: "الملف غير موجود" };
    if (ASSETS_LOCKED_STATUSES.includes(asset.post.status)) {
      return { success: false, error: "الإبداع مقفل بعد الموافقة" };
    }

    await db.socialPostAsset.update({
      where: { id: asset.id },
      data: { label: parsed.data.label.trim() || null },
    });
    revalidateSocialCalendar();
    return { success: true };
  } catch (error) {
    console.error("[social-calendar] updateSocialAssetLabel failed", error);
    return { success: false, error: "تعذّر حفظ التسمية" };
  }
}
