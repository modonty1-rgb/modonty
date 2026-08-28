import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

/**
 * **الاستثناء الوحيد لقاعدة «الغياب يبقى غياباً»** في هذا الملفّ، وهو مقصود.
 *
 * هذه القيمة تذهب إلى `<html lang>`، ووثيقةٌ بلا لغة معلَنة لا يعرف قارئ الشاشة كيف
 * ينطقها ولا المتصفّح كيف يفصلها. فالغياب هنا ليس «نقصاً يُرى» بل عطلٌ في العرض.
 * تبقى مكتوبة، ويبقى العمود في الإعدادات هو المصدر متى حمل قيمة.
 */
const DEFAULT_SITE_LANGUAGE = "ar-SA";

/**
 * The site's content language, from Settings (`/settings/system` → Content Language).
 *
 * It was editable in admin while `<html lang>` and the WebSite entity spelled it in code,
 * so changing it there did nothing (SOT5). One cached read now feeds both, invalidated on
 * the same `settings` tag every admin save already busts.
 */
export async function getSiteLanguage(): Promise<string> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { inLanguage: true },
  });
  return settings?.inLanguage?.trim() || DEFAULT_SITE_LANGUAGE;
}
