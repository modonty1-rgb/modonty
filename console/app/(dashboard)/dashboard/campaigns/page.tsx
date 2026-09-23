import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveOrderForClient } from "@/lib/subscription/active-order";
import { CampaignsTeaser } from "./components/campaigns-teaser";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  // الحصّةُ من الطلب الساري — لا من نسخة الكرت (قاعدة المصدر الواحد).
  const activeOrder = await getActiveOrderForClient(clientId);

  return <CampaignsTeaser monthlyQuota={activeOrder?.articlesPerMonth ?? 0} />;
}
