import { db } from "@/lib/db";

/**
 * الحملات التي يصحّ إسناد عميلٍ إليها — تملأ قائمة «الحملة» في نموذج التسجيل.
 *
 * المسوّدات مستبعَدة: حملةٌ لم تُطلق لم تجلب أحداً، وعرضُها يفتح باب إسنادٍ مستحيل. أمّا
 * المنتهية فتبقى — العميل قد يُسجَّل بعد انتهاء الحملة التي جاء منها بأيام.
 *
 * والسوق يُعرض مع الاسم لأن الأسماء تتشابه بين السوقين («تقويم الأسنان» في السعودية ومصر)،
 * فبلا تمييزٍ تُختار الحملة الخطأ ويُنسب العميل إلى ميزانيةٍ ليست ميزانيته.
 */
export async function getCampaignOptions() {
  const rows = await db.adCampaign.findMany({
    where: { status: { not: "DRAFT" } },
    select: { id: true, name: true, countryCode: true, channel: true, startAt: true },
    orderBy: [{ startAt: "desc" }],
    take: 100,
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    countryCode: r.countryCode,
    channel: r.channel,
  }));
}

export type CampaignOption = Awaited<ReturnType<typeof getCampaignOptions>>[number];
