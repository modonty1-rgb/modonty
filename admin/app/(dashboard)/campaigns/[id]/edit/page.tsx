import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { CampaignForm } from "../../components/campaign-form";

export const metadata = { title: "تعديل البريف" };

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const row = await db.adCampaign.findUnique({
    where: { id },
    select: {
      name: true, countryCode: true, site: true, channel: true, objective: true, status: true,
      startAt: true, endAt: true, dailyBudget: true,
      spendCap: true, platformCampaignId: true, utmCampaign: true, note: true,
      targetRegion: true, targetAge: true, targetAudience: true, landingPath: true,
      code: true, brief: true, approval: true, decisionNote: true, targetCostPerLead: true, destination: true, creativeUrl: true,
    },
  });
  if (!row) notFound();

  return (
    <CampaignForm
      campaignId={id}
      initial={{
        ...row,
        // `countryCode` عمودُ نصٍّ في القاعدة لا تعداد (بقصد — جدول الدول ثلاثة صفوف، وعميلٌ
        // من سوقٍ لم يُنشأ صفُّه بعد يجب أن يُحفظ). فالتضييق يقع هنا عند الحدّ، بنفس احتياطيّ
        // `marketOf`: ما ليس «مصر» فهو السعودية.
        countryCode: (["SA", "EG", "AE", "KW"] as const).find((c) => c === row.countryCode) ?? "SA",
        startAt: row.startAt.toISOString(),
        endAt: row.endAt ? row.endAt.toISOString() : "",
      }}
    />
  );
}
