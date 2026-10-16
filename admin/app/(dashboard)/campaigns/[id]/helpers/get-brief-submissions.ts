import "server-only";

import { db } from "@/lib/db";

export type BriefSubmission = {
  id: string;
  businessName: string;
  phone: string;
  email: string;
  sector: string;
  landingPath: string;
  utmSource: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  status: string;
  whatsappAt: Date | null;
  createdAt: Date;
};

/**
 * تسجيلات صفحات الهبوط اللي جات من إعلانات هذا البريف — بالـ`utm_campaign` اللي يبدأ بكوده
 * («B-002.Instagram.Leads.Oct.2026» ← B-002) أو يساوي وسم البريف (`utmCampaign` = «b-002»).
 * التسجيل بلا UTM ما يُنسب لأي بريف — يُعدّ في الصفحة كـ«بلا مصدر» من نفس صفحة الهبوط.
 */
export async function getBriefSubmissions(code: string | null, utmTag: string, landingPath: string | null) {
  const keys = [...new Set([code, utmTag].filter(Boolean) as string[])];
  const [attributed, untagged] = await Promise.all([
    keys.length
      ? db.campaignSubmission.findMany({
          where: { OR: keys.map((k) => ({ utmCampaign: { startsWith: k, mode: "insensitive" as const } })) },
          orderBy: { createdAt: "desc" },
          take: 2000,
          select: {
            id: true, businessName: true, phone: true, email: true, sector: true, landingPath: true,
            utmSource: true, utmCampaign: true, utmContent: true, status: true, whatsappHandoffAt: true, createdAt: true,
          },
        })
      : Promise.resolve([]),
    landingPath
      ? db.campaignSubmission.count({
          where: { landingPath, OR: [{ utmCampaign: null }, { utmCampaign: { isSet: false } }, { utmCampaign: "" }] },
        })
      : Promise.resolve(0),
  ]);
  const rows: BriefSubmission[] = attributed.map(({ whatsappHandoffAt, ...r }) => ({ ...r, whatsappAt: whatsappHandoffAt }));
  return { rows, untagged };
}
