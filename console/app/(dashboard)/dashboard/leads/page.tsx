import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeads, getLeadStats } from "./helpers/lead-queries";
import { LeadsTable } from "./components/leads-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Flame, TrendingUp, Snowflake, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;

  if (!clientId) {
    redirect("/");
  }

  const [leads, stats] = await Promise.all([
    getLeads(clientId),
    getLeadStats(clientId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Lead Scoring
        </h1>
        <p className="text-muted-foreground mt-1">
          Track and qualify high-engagement visitors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-600" />
              <CardTitle className="text-base font-medium">Hot Leads</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.hot}</p>
            <p className="text-xs text-muted-foreground mt-1">
              High engagement
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-base font-medium">Warm Leads</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.warm}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Moderate engagement
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base font-medium">Cold Leads</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.cold}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Low engagement
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Qualified</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.qualified}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for outreach
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Avg Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.avgScore}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Out of 100
            </p>
          </CardContent>
        </Card>
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}
