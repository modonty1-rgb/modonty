import { db } from "@/lib/db";

/**
 * الحملات مع **عدد مَن جاء منها** — والعدد هو الغرض من الجدول كلّه.
 *
 * `_count` لا استعلامٌ ثانٍ لكل صفّ: القائمة بلا أعداد جدولُ إعلاناتٍ لا تقرير، والسؤال الذي
 * تُفتح الشاشة لأجله هو «أيّ حملة جابت، وبكم؟».
 */
export async function getCampaigns() {
  return db.adCampaign.findMany({
    select: {
      id: true,
      name: true,
      countryCode: true,
      currency: true,
      site: true,
      channel: true,
      objective: true,
      status: true,
      startAt: true,
      endAt: true,
      dailyBudget: true,
      spendCap: true,
      targetRegion: true,
      targetAge: true,
      targetAudience: true,
      landingPath: true,
      platformCampaignId: true,
      utmCampaign: true,
      _count: { select: { leads: true } },
    },
    orderBy: [{ startAt: "desc" }],
    take: 200,
  });
}

export type CampaignRow = Awaited<ReturnType<typeof getCampaigns>>[number];
