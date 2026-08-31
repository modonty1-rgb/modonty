"use client";

import { usePathname } from "next/navigation";

/**
 * الرابط الذي يمثّل الصفحة المفتوحة الآن — بمقارنة المسار الحقيقي، لا بافتراض أن الأوّل
 * هو الحالي.
 *
 * العطل الذي أوجبه (خالد ٣١ أغسطس، مقيس على `/photos`): القوالب كانت تكتب
 * `const current = links[0]?.href`، فتُضاء «الرئيسية» في كل صفحة مهما كان الزائر فيها —
 * والزائر يفقد أهمّ إشارة في الشريط: أين هو. قائمة الجوّال كانت تقارن `pathname` فعلاً،
 * فسلوك الشريطين كان متناقضاً في نفس الموقع.
 *
 * المقارنة على المسار بعد فكّ الترميز: روابط الشريك تحمل حروفاً عربية مرمّزة في
 * `pathname`، فمقارنة نصّية خام تفشل دائماً.
 */
export function useCurrentNavHref(links: { href: string }[]): string | undefined {
  const pathname = usePathname();
  if (!pathname) return undefined;
  const here = decodeURIComponent(pathname).replace(/\/$/, "");
  const match = links.find((l) => decodeURIComponent(l.href).replace(/\/$/, "") === here);
  return match?.href;
}
