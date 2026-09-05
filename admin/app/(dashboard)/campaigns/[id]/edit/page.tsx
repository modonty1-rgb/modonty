import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { CampaignForm } from "../../components/campaign-form";

export const metadata = { title: "تعديل الحملة" };

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const row = await db.adCampaign.findUnique({
    where: { id },
    select: {
      name: true, countryCode: true, site: true, channel: true, objective: true, status: true,
      startAt: true, endAt: true, dailyBudget: true,
      spendCap: true, platformCampaignId: true, utmCampaign: true, note: true,
      targetRegion: true, targetAge: true, targetAudience: true, landingPath: true,
    },
  });
  if (!row) notFound();

  return (
    <CampaignForm
      campaignId={id}
      initial={{
        ...row,
        startAt: row.startAt.toISOString(),
        endAt: row.endAt.toISOString(),
      }}
    />
  );
}
