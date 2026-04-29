import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  getDashboardStats,
  getTopArticles,
  getTrafficSources,
  getViewsOverTime,
  getRecentActivity,
} from "./helpers/dashboard-queries";
import { getPendingArticlesCount } from "./articles/helpers/article-queries";
import { getPendingCommentsCount } from "./comments/helpers/comment-queries";
import {
  BarChart3,
  TrendingUp,
  Users,
  Share2,
  MessageSquare,
  Target,
  FileText,
  Mail,
  Clock,
  Eye,
  Repeat,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { TrafficChart } from "./components/traffic-chart";
import { ViewsChart } from "./components/views-chart";
import { TopArticlesChart } from "./components/top-articles-chart";
import {
  DashboardStatCard,
  type StatBadge,
  type StatTrend,
} from "./components/dashboard-stat-card";
import { DashboardActionCard } from "./components/dashboard-action-card";

export const dynamic = "force-dynamic";

function formatAvgTime(seconds: number): string {
  if (seconds <= 0) return "—";
  const minutes = seconds / 60;
  if (minutes < 1) {
    return `${Math.round(seconds)}ث`;
  }
  if (minutes >= 30) {
    return ar.dashboard.avgTimeManyMinutes.replace("{n}", "30");
  }
  return ar.dashboard.avgTimeMinutes.replace("{n}", minutes.toFixed(1));
}

function engagementBadge(score: number): StatBadge {
  if (score >= 80) return { label: ar.dashboard.benchmarkExcellent, tone: "emerald" };
  if (score >= 60) return { label: ar.dashboard.benchmarkGood, tone: "emerald" };
  if (score >= 40) return { label: ar.dashboard.benchmarkAverage, tone: "amber" };
  return { label: ar.dashboard.benchmarkLow, tone: "red" };
}

function trend(pct: number, label: string, inverted = false): StatTrend {
  return { value: pct, label, inverted };
}

export default async function DashboardPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const [
    stats,
    topByViews,
    topByEngagement,
    trafficSources,
    viewsOverTime,
    recentActivity,
    pendingArticlesCount,
    pendingCommentsCount,
    client,
  ] = await Promise.all([
    getDashboardStats(clientId),
    getTopArticles(clientId, "views", 5),
    getTopArticles(clientId, "engagement", 5),
    getTrafficSources(clientId, 30),
    getViewsOverTime(clientId, 7),
    getRecentActivity(clientId, 10),
    getPendingArticlesCount(clientId),
    getPendingCommentsCount(clientId),
    db.client.findUnique({
      where: { id: clientId },
      select: { name: true },
    }),
  ]);

  const d = ar.dashboard;
  const clientName = client?.name ?? ar.common.clientFallback;

  return (
    <div className="space-y-8">
      {/* ─── HEADER + month summary ──────────────────────────── */}
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {d.greetingFor.replace("{name}", clientName)}
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">{d.welcome}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {d.thisMonth}
          </span>
          <span className="text-sm text-foreground">
            <span className="font-bold tabular-nums">
              {stats.content.monthlyPublished}
            </span>{" "}
            {d.thisMonthArticles.replace("{n} ", "")}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-foreground">
            <span className="font-bold tabular-nums">
              {stats.analytics.views30d.toLocaleString()}
            </span>{" "}
            {d.thisMonthViews.replace("{n} ", "")}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-foreground">
            <span className="font-bold tabular-nums">
              {stats.content.newSubscribersThisMonth}
            </span>{" "}
            {d.thisMonthSubscribers.replace("{n} ", "")}
          </span>
        </div>
      </header>

      {/* ─── SECTION 1: Action Items ─────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            {d.actionItemsTitle}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {d.actionItemsSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardActionCard
            href="/dashboard/articles"
            icon={FileText}
            title={d.articles}
            description={d.manageApprove}
            value={
              pendingArticlesCount > 0
                ? `${pendingArticlesCount} ${d.pendingApproval}`
                : d.allApproved
            }
            ctaLabel={d.manageApprove}
          />
          <DashboardActionCard
            href="/dashboard/comments"
            icon={MessageSquare}
            title={d.comments}
            description={d.moderationQueue}
            value={
              pendingCommentsCount > 0
                ? `${pendingCommentsCount} ${d.pendingReview}`
                : d.allReviewed
            }
            ctaLabel={d.moderateComments}
          />
          <DashboardActionCard
            href="/dashboard/support"
            icon={Mail}
            title={d.support}
            description={d.contactMessages}
            value={d.viewMessages}
            ctaLabel={d.manageSupport}
          />
        </div>
      </section>

      {/* ─── SECTION 2: Performance ──────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {d.performanceTitle}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {d.performanceSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          <DashboardStatCard
            icon={Eye}
            tone="primary"
            title={d.analytics}
            value={stats.analytics.views7d.toLocaleString()}
            hint={d.days7}
            trend={trend(stats.analytics.views7dTrendPct, d.vsLastWeek)}
          />
          <DashboardStatCard
            icon={Award}
            tone="emerald"
            title={d.engagementScore}
            value={`${stats.analytics.engagementScore} / 100`}
            hint={`${d.avgTime}: ${formatAvgTime(stats.analytics.avgTimeOnPage)} · ${d.scroll}: ${Math.round(stats.analytics.avgScrollDepth)}%`}
            badge={engagementBadge(stats.analytics.engagementScore)}
          />
          <DashboardStatCard
            icon={Target}
            tone="violet"
            title={d.conversions}
            value={stats.conversions.total}
            hint={`${d.rate}: ${stats.conversions.rate.toFixed(2)}%`}
          />
          <DashboardStatCard
            icon={TrendingUp}
            tone="amber"
            title={d.bounce}
            value={`${stats.analytics.bounceRate.toFixed(1)}%`}
            hint={d.last30Days}
          />
        </div>
      </section>

      {/* ─── SECTION 3: Audience ─────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {d.audienceTitle}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {d.audienceSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          <DashboardStatCard
            icon={Mail}
            tone="emerald"
            title={d.subscribers}
            value={stats.content.totalSubscribers.toLocaleString()}
            hint={`${stats.content.newSubscribersThisMonth} ${d.thisMonthSubscribers.replace("{n} ", "")}`}
          />
          <DashboardStatCard
            icon={Users}
            tone="primary"
            title={d.activeUsers}
            value={stats.engagement.activeUsers7d.toLocaleString()}
            hint={`${d.days7} · ${stats.engagement.activeUsers30d.toLocaleString()} ${d.days30}`}
          />
          <DashboardStatCard
            icon={Repeat}
            tone="violet"
            title={d.returnRate}
            value={`${stats.engagement.returnVisitorRate.toFixed(1)}%`}
            hint={d.last30Days}
          />
          <DashboardStatCard
            icon={Share2}
            tone="amber"
            title={d.interactions}
            value={
              stats.interactions.totalLikes +
              stats.interactions.totalShares +
              stats.interactions.totalComments
            }
            hint={`${stats.interactions.totalLikes} ${d.likes} · ${stats.interactions.totalShares} ${d.shares} · ${stats.interactions.totalComments} ${d.commentsLabel}`}
          />
        </div>
      </section>

      {/* ─── Charts row 1: Top by views | Traffic sources ────── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {d.byViews}
            </CardTitle>
            <CardDescription>{d.topPerforming}</CardDescription>
          </CardHeader>
          <CardContent>
            {topByViews.length > 0 ? (
              <TopArticlesChart data={topByViews} metricLabel={d.views} />
            ) : (
              <EmptyChart message={d.noArticles} />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{d.trafficSources}</CardTitle>
            <CardDescription>{d.last30Days}</CardDescription>
          </CardHeader>
          <CardContent>
            {trafficSources.length > 0 ? (
              <TrafficChart data={trafficSources} />
            ) : (
              <EmptyChart message={d.noTraffic} />
            )}
          </CardContent>
        </Card>
      </section>

      {/* ─── Views over time (full width) ────────────────────── */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {ar.analytics.views7d}
          </CardTitle>
          <CardDescription>{d.viewsEngagement}</CardDescription>
        </CardHeader>
        <CardContent>
          {viewsOverTime.length > 0 ? (
            <ViewsChart data={viewsOverTime} />
          ) : (
            <EmptyChart message={d.noTraffic} />
          )}
        </CardContent>
      </Card>

      {/* ─── Charts row 2: Engagement leaders | Activity ─────── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-600" />
              {d.byEngagement}
            </CardTitle>
            <CardDescription>{d.score}</CardDescription>
          </CardHeader>
          <CardContent>
            {topByEngagement.length > 0 ? (
              <ul className="divide-y divide-border">
                {topByEngagement.map((article) => (
                  <li
                    key={article.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {article.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold tabular-nums text-emerald-700 ring-1 ring-emerald-200">
                      {article.engagementScore}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyChart message={d.noArticles} />
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
                        {new Intl.DateTimeFormat("en-GB", {
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
