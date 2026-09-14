import { cacheTag } from "next/cache";

import { db } from "@/lib/db";

/**
 * شعار المنصّة وحساباتها — من الإعدادات لا من الكود.
 *
 * تحت وسم `settings` نفسه الذي تُبطله شاشة الأدمن عند كل حفظ، فتبديل الشعار أو إضافة
 * حساب جديد يظهر على صفحة البيع بلا نشر. والقائمة مغلقة: ما ليس في الإعدادات لا يُرسم،
 * فلا رابط ميت في تذييل صفحةٍ يقرؤها مشترٍ متردّد.
 */
export type SocialLink = { name: string; href: string };
export type SiteChrome = {
  siteName: string | null;
  logoUrl: string | null;
  socials: SocialLink[];
};

export async function getSiteChrome(): Promise<SiteChrome> {
  "use cache";
  cacheTag("settings");

  const s = await db.settings.findFirst({
    select: {
      siteName: true, logoUrl: true, logoIconUrl: true,
      facebookUrl: true, twitterUrl: true, linkedInUrl: true,
      instagramUrl: true, youtubeUrl: true, tiktokUrl: true,
      snapchatUrl: true, whatsappChannelUrl: true,
    },
  });

  const pairs: [string, string | null | undefined][] = [
    ["x", s?.twitterUrl],
    ["instagram", s?.instagramUrl],
    ["linkedin", s?.linkedInUrl],
    ["facebook", s?.facebookUrl],
    ["tiktok", s?.tiktokUrl],
    ["youtube", s?.youtubeUrl],
    ["snapchat", s?.snapchatUrl],
    ["whatsapp", s?.whatsappChannelUrl],
  ];

  return {
    siteName: s?.siteName ?? null,
    logoUrl: s?.logoUrl ?? s?.logoIconUrl ?? null,
    socials: pairs
      .filter(([, href]) => typeof href === "string" && href.trim().length > 0)
      .map(([name, href]) => ({ name, href: (href as string).trim() })),
  };
}
