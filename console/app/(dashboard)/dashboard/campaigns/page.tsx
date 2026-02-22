import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { redirect } from "next/navigation";
import { getCampaignsList, getUTMPerformance, getCampaignStats } from "./helpers/campaign-queries";
import { CampaignsTable } from "./components/campaigns-table";
import { UTMTable } from "./components/utm-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MousePointer, Target, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;

  if (!clientId) {
    redirect("/");
  }

  const [campaigns, utmData, stats] = await Promise.all([
    getCampaignsList(clientId, 30),
    getUTMPerformance(clientId, 30),
    getCampaignStats(clientId, 30),
  ]);

  const avgCTR =
    stats.totalImpressions > 0
      ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2)
      : "0";
  const avgConversionRate =
    stats.totalClicks > 0
      ? ((stats.totalConversions / stats.totalClicks) * 100).toFixed(2)
      : "0";

  const c = ar.campaigns;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-semibold leading-tight text-foreground">
            {c.title}
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {c.beta}
          </span>
        </div>
        <p className="text-muted-foreground mt-1">
          {c.trackCampaigns}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{c.totalCampaigns}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.totalCampaigns}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {c.activeLast30Days}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{c.totalClicks}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.totalClicks.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {c.ctr}: {avgCTR}%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{c.conversions}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.totalConversions}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {c.rate}: {avgConversionRate}%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{c.totalCost}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.totalCost.toLocaleString()} SAR
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {c.campaignSpend}
            </p>
          </CardContent>
        </Card>
      </div>

      <CampaignsTable campaigns={campaigns} />
      <UTMTable utmData={utmData} />
    </div>
  );
}
