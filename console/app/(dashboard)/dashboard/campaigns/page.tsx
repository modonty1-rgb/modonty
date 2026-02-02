import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCampaignsList, getUTMPerformance, getCampaignStats } from "./helpers/campaign-queries";
import { CampaignsTable } from "./components/campaigns-table";
import { UTMTable } from "./components/utm-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Campaign Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your marketing campaigns and UTM performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Total Campaigns</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.totalCampaigns}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Active in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Total Clicks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.totalClicks.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              CTR: {avgCTR}%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Conversions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.totalConversions}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Rate: {avgConversionRate}%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Total Cost</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.totalCost.toLocaleString()} SAR
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Campaign spend
            </p>
          </CardContent>
        </Card>
      </div>

      <CampaignsTable campaigns={campaigns} />
      
      <UTMTable utmData={utmData} />
    </div>
  );
}
