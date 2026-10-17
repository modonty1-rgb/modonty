import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { parseModoImages, type ModoImages } from "@modonty/shared/lib/modo-images";

/**
 * صور مودو — وضعية ← رابط، مصدرها الوحيد Settings.modoImages التي يختارها الفريق في الأدمن
 * (/modonty/modo) من مكتبة العميل الأساسي «مدونتي». لا رابط مكتوب في الكود (خالد ١٧ أكتوبر ٢٠٢٦).
 * مخزّنة بوسم "settings" فيُبطلها حفظ الأدمن.
 */
export async function getModoImages(): Promise<ModoImages> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const settings = await db.settings.findUnique({ where: SETTINGS_SINGLETON_WHERE, select: { modoImages: true } });
  return parseModoImages(settings?.modoImages);
}
