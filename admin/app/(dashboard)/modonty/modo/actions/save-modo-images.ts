"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { ensureSettingsId } from "@/lib/settings/settings-singleton";
import { MODO_POSES, parseModoImages, type ModoImages } from "@modonty/shared/lib/modo-images";

/**
 * صور مودو — الحفظ (خالد ١٧ أكتوبر ٢٠٢٦: «مودو من ضمن الأصول اللي تترفع في الكور كلاينت… ما في هارد كودد»).
 * كل وضعية رابط صورة من مكتبة العميل الأساسي، يُختار في /modonty/modo ويُحفظ في Settings.modoImages.
 */

const schema = z.object(
  Object.fromEntries(MODO_POSES.map((p) => [p.key, z.string().trim().url().startsWith("https://").optional().or(z.literal(""))])),
);

export async function saveModoImages(input: ModoImages): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "غير مصرّح — سجّل الدخول." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "رابط غير صالح في إحدى الوضعيات." };

  const images = parseModoImages(parsed.data); // empties dropped — a cleared pose falls back to the avatar
  const id = await ensureSettingsId();
  await db.settings.update({ where: { id }, data: { modoImages: images } });

  // the site reads Modo through the "settings" tag; the mobile API reads the same row
  await revalidateModontyTag("settings");
  revalidatePath("/modonty/modo");
  return { ok: true };
}
