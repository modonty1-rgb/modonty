import { db } from "@/lib/db";

/**
 * البريفات التي يصحّ إسناد عميلٍ إليها — تملأ قائمة «الحملة» في نموذج التسجيل.
 *
 * الموافَق عليها وحدها (خالد ٢٩ سبتمبر ٢٠٢٦): موافَق عليها · شغّالة · موقوفة. ما ينتظر الموافقة أو
 * رُفض لم يُصرف عليه بإذن، فلا يُنسب إليه عميل. والموقوفة تبقى — العميل قد يُسجَّل بعد إيقاف الحملة
 * التي جاء منها بأيام. (كان الشرط `status ≠ DRAFT`، فيُسقط البريف الموافَق الذي لم يُشغَّل بعد ويُدخل
 * المرفوض إن حمل حالةً قديمة.)
 *
 * الكود أوّل الاسم لأنه نفسه في اسم الحملة في ميتا — المندوب يطابق عليه. والسوق يُعرض مع الاسم لأن
 * الأسماء تتشابه بين الأسواق («تقويم الأسنان» في السعودية ومصر).
 */
export async function getCampaignOptions() {
  const rows = await db.adCampaign.findMany({
    where: { approval: "APPROVED" },
    select: { id: true, code: true, name: true, countryCode: true, channel: true },
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  });

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    countryCode: r.countryCode,
    channel: r.channel,
  }));
}

export type CampaignOption = Awaited<ReturnType<typeof getCampaignOptions>>[number];
