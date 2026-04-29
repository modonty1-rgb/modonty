import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Loader2 } from "lucide-react";
import { runHealthCheck } from "@/lib/health/aggregator";
import { ScoreHero } from "./components/score-hero";
import { CategorySection } from "./components/category-section";
import { PagespeedCard } from "./components/pagespeed-card";

export const dynamic = "force-dynamic";

export default async function SiteHealthPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { name: true, url: true, slug: true },
  });
  if (!client) redirect("/");

  // Determine which URL to check.
  // Priority: client.url (their actual domain) > modonty client slug page
  const targetUrl =
    client.url ||
    `https://www.modonty.com/clients/${encodeURIComponent(client.slug)}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          صحة موقعك
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          فحص شامل لموقعك: الأمان، الأداء، SEO، DNS — كله محدّث الآن.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-xs leading-relaxed text-foreground">
            هذي الفحوصات تجري لحظياً — ما نخزّنها في قاعدة البيانات. كل ما تفتح
            الصفحة، نعيد الفحص ونعرض الحالة الحالية. الفحص يمر بـ{" "}
            <span className="font-mono dir-ltr">{targetUrl}</span>.
          </p>
        </div>
      </header>

      <Suspense
        fallback={
          <Card className="shadow-sm">
            <CardContent className="flex items-center justify-center gap-3 p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                جاري فحص موقعك… (3-10 ثواني)
              </p>
            </CardContent>
          </Card>
        }
      >
        <HealthReport url={targetUrl} />
      </Suspense>
    </div>
  );
}

async function HealthReport({ url }: { url: string }) {
  const report = await runHealthCheck(url);

  return (
    <div className="space-y-6">
      <PagespeedCard scores={report.pagespeed} url={report.url} />
      <ScoreHero report={report} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {report.categories.map((c) => (
          <CategorySection key={c.category} report={c} />
        ))}
      </div>
    </div>
  );
}
