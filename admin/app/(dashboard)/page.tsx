import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { getDashboardAlerts } from "./actions/dashboard-actions";
import { DashboardAlertsBanner } from "./components/dashboard-alerts-banner";
import { TodayStrip } from "./components/sections/today-strip";
import { VisitorActionsBreakdown } from "./components/sections/visitor-actions-breakdown";
import { ArticlesPipeline } from "./components/sections/articles-pipeline";
import { ClientsPipeline } from "./components/sections/clients-pipeline";
import { MediaLibrary } from "./components/sections/media-library";
import { ReferenceData } from "./components/sections/reference-data";

/**
 * The dashboard is a TRIAGE screen, and the Today strip is its answer
 * (contract: documents/mockups/admin-dashboard-triage-v2-ui.html, approved 2026-07-13).
 *
 * Reading order = business order: what needs me now (Today) → what visitors did →
 * our content → the money → the housekeeping (media + reference share one row).
 * Every number the strip ranks comes from the same cached fetch its section uses,
 * so the two can never disagree.
 */
export default async function DashboardPage() {
  const alerts = await getDashboardAlerts();

  return (
    <div className="mx-auto max-w-[1280px] space-y-7">
      {/* 1 · The ranked answer to "what needs you today" (includes the page header) */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-14 w-72" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <TodayStrip />
      </Suspense>

      {/* Urgent cross-source alerts — renders nothing when all is clear */}
      <DashboardAlertsBanner alerts={alerts} />

      {/* 2 · What visitors did to us */}
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <VisitorActionsBreakdown />
      </Suspense>

      {/* 3 · Where our own content stands */}
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <ArticlesPipeline />
      </Suspense>

      {/* 4 · Where the money stands */}
      <Suspense fallback={<Skeleton className="h-72 w-full" />}>
        <ClientsPipeline />
      </Suspense>

      {/* 5 · Housekeeping — two small sections share one row */}
      <div className="grid gap-7 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <MediaLibrary />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <ReferenceData />
        </Suspense>
      </div>
    </div>
  );
}
