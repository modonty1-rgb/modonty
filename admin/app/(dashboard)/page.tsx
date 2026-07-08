import { Suspense } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

import { getDashboardAlerts } from "./actions/dashboard-actions";
import { getGA4Activity } from "./analytics/actions/get-ga4-activity";
import { getClients } from "./analytics/actions/get-clients";
import { getArticles } from "./analytics/actions/get-articles";
import { DashboardAlertsBanner } from "./components/dashboard-alerts-banner";
import { FullActivityClient } from "./analytics/components/full-activity-client";
import { VisitorActionsBreakdown } from "./components/sections/visitor-actions-breakdown";
import { ArticleWorkflowBoard } from "./components/sections/article-workflow-board";
import { GscSection } from "./components/sections/gsc-section";
import { GscSectionSkeleton } from "./components/sections/gsc-section-skeleton";

// Merged dashboard = «ترمومتر مدونتي» (approved mockup dashboard-thermometer-merge-v1,
// 2026-07-08): alerts → GA4 activity + Visitor Actions breakdown → timeline/sources/geo/
// tables (FullActivityClient) → article workflow → Search Console. Killed: the GA4
// "under construction" placeholder, the duplicate date selector, and the DB/Ops section
// (it has its own /database page).
export default async function DashboardPage() {
  const [alerts, activity, clients, articles] = await Promise.all([
    getDashboardAlerts(),
    getGA4Activity(),
    getClients(),
    getArticles(),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMM d, yyyy")} — everything that matters, nothing else
        </p>
      </div>

      {/* 1 · Urgent, cross-source */}
      <DashboardAlertsBanner alerts={alerts} />

      {/* 2 · Visitor actions — the business pulse */}
      <Suspense fallback={<Skeleton className="h-28 w-full" />}>
        <VisitorActionsBreakdown />
      </Suspense>

      {/* 3 · Full GA4 activity: KPIs, timeline, sources, geo, tables + filters */}
      <FullActivityClient initialData={activity} clients={clients} articles={articles} />

      {/* 4 · Daily ops */}
      <ArticleWorkflowBoard />

      {/* 5 · Search health */}
      <Suspense fallback={<GscSectionSkeleton />}>
        <GscSection days={7} />
      </Suspense>
    </div>
  );
}
