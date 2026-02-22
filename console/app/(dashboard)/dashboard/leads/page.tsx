import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { redirect } from "next/navigation";
import { getLeads, getLeadStats } from "./helpers/lead-queries";
import { LeadsTable } from "./components/leads-table";
import { RefreshLeadScoresButton } from "./components/refresh-lead-scores-button";
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

  const l = ar.leads;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">
            {l.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {l.trackQualify}
          </p>
        </div>
        <RefreshLeadScoresButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-destructive" />
              <CardTitle className="text-base font-medium">{l.hotLeads}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.hot}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {l.highEngagement}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{l.warmLeads}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.warm}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {l.moderateEngagement}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">{l.coldLeads}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.cold}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {l.lowEngagement}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{l.qualified}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.qualified}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {l.readyForOutreach}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{l.avgScore}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.avgScore}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {l.outOf100}
            </p>
          </CardContent>
        </Card>
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}
