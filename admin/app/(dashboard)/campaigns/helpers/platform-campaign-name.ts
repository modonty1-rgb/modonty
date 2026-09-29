import type { AdChannel, AdObjective } from "@prisma/client";

const CHANNEL: Record<AdChannel, string> = {
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  SNAPCHAT: "Snapchat",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TWITTER: "X",
  LINKEDIN: "LinkedIn",
  GOOGLE: "Google",
};
const OBJECTIVE: Record<AdObjective, string> = {
  LEADS: "Leads",
  SALES: "Sales",
  TRAFFIC: "Traffic",
  ENGAGEMENT: "Engagement",
  AWARENESS: "Awareness",
};
const MONTH = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" });

/**
 * اسم الحملة في المنصّة — نحن نحدّده والميديا باير ينسخه كما هو (خالد ٢٩ سبتمبر ٢٠٢٦: «ليش ما
 * نحدّد الاسم تبع الحملة وهو ياخد كوبي وبيست»). فلا يُنسى الكود ولا يُكتب خطأً، وتقارير المنصّة
 * تقرأ بقاعدةٍ واحدة: `B-003 | Instagram | Leads | SA | Sep 2026`.
 *
 * لاتينيّ عمداً: ميتا تعرض الأسماء في التقارير والتصدير، والعربيّ مع الشرطات العمودية ينقلب اتجاهه.
 */
export function platformCampaignName(input: {
  code: string;
  channel: AdChannel | "" | null;
  objective: AdObjective | "" | null;
  countryCode: string;
  startAt: Date | string;
}): string {
  const start = new Date(input.startAt);
  return [
    input.code,
    input.channel ? CHANNEL[input.channel] : null,
    input.objective ? OBJECTIVE[input.objective] : null,
    input.countryCode,
    Number.isNaN(start.getTime()) ? null : MONTH.format(start),
  ]
    .filter(Boolean)
    .join(" | ");
}
