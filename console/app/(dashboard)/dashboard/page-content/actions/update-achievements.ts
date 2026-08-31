"use server";

import { revalidatePath } from "next/cache";

import { deleteBunnyUrl } from "@modonty/shared/lib/bunny";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";
import type { AchievementInput } from "../helpers/page-content-types";

type Result = { success: true } | { success: false; error: string };

const LABEL_MAX = 52;
const DESC_MAX = 250;

function clean(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

/**
 * حفظ الإنجازات وحدها — مثل الاعتمادات تماماً: الحوار يحفظ ما فُتح لأجله، فلا يثبّت معه
 * تعديلات أقسام أخرى ما طلب الشريك تثبيتها.
 *
 * وتنظيف الصور اليتيمة جزء من الحفظ لا خطوة لاحقة: إنجاز يُحذف تبقى صورته على بني
 * تُدفع فاتورتها إلى الأبد إن لم تُحذف هنا.
 */
export async function updateAchievements(achievements: AchievementInput[]): Promise<Result> {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId ?? null;
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const rows = (achievements ?? [])
    .map((a) => ({
      value: (a.value ?? "").trim(),
      label: (a.label ?? "").trim().slice(0, LABEL_MAX),
      image: clean(a.image),
      description: clean(a.description)?.slice(0, DESC_MAX) ?? null,
    }))
    .filter((a) => a.value.length > 0 && a.label.length > 0);

  // تُقرأ قبل الكتابة: بعدها ما عاد لها أثر يُعرف منه المحذوف.
  const existing = await db.client.findUnique({
    where: { id: clientId },
    select: { achievements: { select: { image: true } } },
  });
  const oldImages = (existing?.achievements ?? [])
    .map((a) => a.image)
    .filter((u): u is string => Boolean(u));

  try {
    await db.client.update({
      where: { id: clientId },
      data: { achievements: { set: rows } },
    });

    const kept = new Set(rows.map((a) => a.image).filter(Boolean));
    for (const url of oldImages) {
      if (!kept.has(url)) {
        try {
          await deleteBunnyUrl("reels", url);
        } catch {
          /* best-effort — حذف صورة فاشل ما يفشّل الحفظ */
        }
      }
    }

    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort */
    }
    revalidatePath("/dashboard/page-content");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
