import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

/**
 * `Settings.brandDescription` — الجملة التي تصف المنصّة حين تُقدَّم كاملةً: وصف قناة
 * الخلاصة، ووصف الكيان حيث لا يوجد وصفٌ أخصّ.
 *
 * كانت مكتوبة في `feed.xml/route.ts` حرفياً، فتغييرها يحتاج نشرة — وهي جملةٌ تحريرية
 * يملكها الأدمن. وبغياب العمود لا يُبَثّ وسم وصف: قارئ الخلاصة يرى العنوان والروابط،
 * وهذا أصدق من جملة عامّة تتكرّر على كل قناة.
 */
export async function getBrandDescription(): Promise<string | undefined> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const s = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { brandDescription: true },
  });

  return s?.brandDescription?.trim() || undefined;
}
