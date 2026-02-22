import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ar } from "@/lib/ar";
import { getClientSeoData } from "../helpers/seo-queries";
import { SeoSubNav } from "../components/seo-sub-nav";
import { KeywordsTab } from "../components/keywords-tab";

export const dynamic = "force-dynamic";

export default async function SeoKeywordsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const data = await getClientSeoData(clientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">{ar.nav.seo}</h1>
        <p className="text-muted-foreground mt-1">إدارة بيانات SEO واستمارة الاستقبال والمنافسين والكلمات المفتاحية</p>
      </div>
      <SeoSubNav />
      <KeywordsTab clientId={clientId} keywords={data.keywords} />
    </div>
  );
}
