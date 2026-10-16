import "server-only";

import { db } from "@/lib/db";

/**
 * ضغطات الواتساب المحفوظة من صفحات الهبوط بلا نموذج (`landing_clicks`) — بنفس قاعدة النسبة للبريف
 * اللي في التسجيلات: `utm_campaign` يبدأ بكوده أو بوسمه.
 */
export async function getBriefLandingClicks(code: string | null, utmTag: string) {
  const keys = [...new Set([code, utmTag].filter(Boolean) as string[])];
  if (keys.length === 0) return [];
  return db.landingClick.findMany({
    where: { OR: keys.map((k) => ({ utmCampaign: { startsWith: k, mode: "insensitive" as const } })) },
    orderBy: { createdAt: "desc" },
    take: 5000,
    select: { landingPath: true, cta: true, utmContent: true, createdAt: true },
  });
}
