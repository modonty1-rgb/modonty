import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getGoogleReportUrl } from "./helpers/get-google-report-url";
import { GoogleIcon } from "@modonty/shared/components/icons/google-icon";
import { getTrafficSources, getRecentActivity } from "./helpers/dashboard-queries";
import {
  getPendingArticlesCount,
  getPendingCommentsCount,
  getNewSupportMessagesCount,
} from "@/lib/nav-counts";
import { getDashboardPeriod } from "./helpers/get-dashboard-period";
import { BarChart3, MessageSquare, Target, FileText, Clock, CheckCircle2 } from "lucide-react";
import { TrafficChart } from "./components/traffic-chart";
import { PeriodFilter } from "./components/period-filter";
import { AttentionStrip } from "./components/attention-strip";
import { DashboardOverview, DashboardOverviewSkeleton } from "./components/dashboard-overview";
import { SITE_LOCALE_GREGORIAN } from "@modonty/shared/lib/constants/locale";

export const dynamic = "force-dynamic";

/**
 * The client's home: one period filter, what waits for him, and one answer — «وش جاب لي محتواي؟»
 * (Khalid, 30 Sep 2026: «بسيطة وأنيقة وتدي الرسالة»). Every number reads the same window.
 * It replaced ~15 cards on five different windows (7/28/30 days and a «this month» that was
 * really the last 30 days), with technical scores the client could not act on.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string | string[] }>;
}) {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const days = getDashboardPeriod((await searchParams).period);
  const [trafficSources, recentActivity, pendingArticlesCount, pendingCommentsCount, newSupportCount, client] =
    await Promise.all([
      getTrafficSources(clientId, days),
      getRecentActivity(clientId, 8),
      getPendingArticlesCount(clientId),
      getPendingCommentsCount(clientId),
      getNewSupportMessagesCount(clientId),
      db.client.findUnique({ where: { id: clientId }, select: { name: true } }),
    ]);

  const d = ar.dashboard;
  const clientName = client?.name ?? ar.common.clientFallback;

  return (
    <div className="space-y-6">
      {/* The account notice lives in the dashboard LAYOUT — it follows the client to
          every page, so it must not be repeated here. */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {d.greetingFor.replace("{name}", clientName)}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Google's own report, not ours — so the client can check every number at the source. */}
          <a
            href={getGoogleReportUrl(clientId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted max-md:h-11"
          >
            <GoogleIcon />
            {d.googleReportButton}
          </a>
          <PeriodFilter value={days} />
        </div>
      </header>

      <AttentionStrip pendingArticles={pendingArticlesCount} pendingComments={pendingCommentsCount} newSupport={newSupportCount} />

      {/* key: a new period streams its own skeleton instead of showing the old numbers. */}
      <Suspense key={days} fallback={<DashboardOverviewSkeleton />}>
        <DashboardOverview clientId={clientId} days={days} />
      </Suspense>

      {/* ─── Traffic sources | Recent activity ─────────────────── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{d.trafficSources}</CardTitle>
            <CardDescription>{(days <= 10 ? d.periodDaysFew : d.periodDays).replace("{n}", String(days))}</CardDescription>
          </CardHeader>
          <CardContent>
            {trafficSources.length > 0 ? (
              <TrafficChart data={trafficSources} />
            ) : (
              <EmptyChart message={d.noTraffic} />
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {d.recentActivity}
            </CardTitle>
            <CardDescription>{d.latestUpdates}</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <ul className="divide-y divide-border" role="list">
                {recentActivity.map((activity, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
                      {activity.type === "article" && (
                        <FileText className="h-4 w-4" />
                      )}
                      {activity.type === "conversion" && (
                        <Target className="h-4 w-4 text-violet-600" />
                      )}
                      {activity.type === "comment" && (
                        <MessageSquare className="h-4 w-4 text-amber-600" />
                      )}
                      {activity.type === "subscriber" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                        {new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(activity.timestamp))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">{d.noActivity}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <p className="text-center text-sm">
        <Link href="/dashboard/analytics" className="inline-flex min-h-11 items-center text-primary hover:underline">
          {d.moreInAnalytics} ←
        </Link>
      </p>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="grid place-items-center py-8 text-center">
      <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
