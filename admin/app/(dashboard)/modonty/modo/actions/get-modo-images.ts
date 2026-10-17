import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { parseModoImages, type ModoImages } from "@modonty/shared/lib/modo-images";

/** صور مودو المحفوظة — وضعية ← رابط من مكتبة العميل الأساسي «مدونتي». */
export async function getModoImages(): Promise<ModoImages> {
  const s = await db.settings.findUnique({ where: SETTINGS_SINGLETON_WHERE, select: { modoImages: true } });
  return parseModoImages(s?.modoImages);
}
