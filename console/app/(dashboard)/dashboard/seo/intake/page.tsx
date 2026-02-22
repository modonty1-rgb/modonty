import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientSeoData } from "../helpers/seo-queries";
import { IntakeTab } from "../components/intake-tab";

export const dynamic = "force-dynamic";

export default async function SeoIntakePage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const data = await getClientSeoData(clientId);

  return (
    <IntakeTab
      clientId={clientId}
      clientSlug={data.client?.slug ?? null}
      clientUrl={data.client?.url ?? null}
      clientSameAs={data.client?.sameAs ?? null}
      latestIntake={data.latestIntake}
    />
  );
}
