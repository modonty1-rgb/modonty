import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CampaignsTeaser } from "./components/campaigns-teaser";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { articlesPerMonth: true },
  });

  return <CampaignsTeaser monthlyQuota={client?.articlesPerMonth ?? 0} />;
}
