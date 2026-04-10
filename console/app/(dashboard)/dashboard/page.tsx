import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
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
import { BarChart3, TrendingUp, Users, Share2, MessageSquare, Target, FileText, Mail } from "lucide-react";
import { TrafficChart } from "./components/traffic-chart";
import { ViewsChart } from "./components/views-chart";
import { TopArticlesChart } from "./components/top-articles-chart";
import { DashboardStatCard } from "./components/dashboard-stat-card";
import { DashboardActionCard } from "./components/dashboard-action-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const [stats, topByViews, topByEngagement, topByConversions, trafficSources, viewsOverTime, recentActivity, pendingCount, pendingCommentsCount] =
    await Promise.all([
      getDashboardStats(clientId),
      getTopArticles(clientId, "views", 5),
      getTopArticles(clientId, "engagement", 5),
      getTopArticles(clientId, "conversions", 5),
      getTrafficSources(clientId, 30),
      getViewsOverTime(clientId, 7),
      getRecentActivity(clientId, 10),
      getPendingArticlesCount(clientId),
      getPendingCommentsCount(clientId),
    ]);

  return (
    <div className="space-y-8">
      <section aria-labelledby="dashboard-heading">
        <div className="mb-6">
          <h1 id="dashboard-heading" className="text-2xl font-semibold leading-tight text-foreground">
            {ar.nav.dashboard}
          </h1>
          <p className="text-muted-foreground mt-1">
            {ar.dashboard.welcome}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="min-w-[160px] flex-1">
            <DashboardStatCard
              icon={Users}
              title={ar.dashboard.subscribers}
              description={ar.dashboard.newsletterList}
              value={stats.content.totalSubscribers}
              subLines={[ar.dashboard.totalSubscribers]}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <DashboardActionCard
              href="/dashboard/articles"
              icon={FileText}
              title={ar.dashboard.articles}
              description={ar.dashboard.manageApprove}
              value={
                pendingCount > 0
                  ? `${pendingCount} ${ar.dashboard.pendingApproval}`
                  : ar.dashboard.allApproved
              }
              ctaLabel={ar.dashboard.manageApprove}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <DashboardActionCard
              href="/dashboard/analytics"
              icon={BarChart3}
              title={ar.dashboard.analytics}
              description={ar.dashboard.viewsEngagement}
              value={`${stats.analytics.views7d.toLocaleString()} ${ar.dashboard.views}`}
              ctaLabel={ar.dashboard.viewAnalytics}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <DashboardActionCard
              href="/dashboard/comments"
              icon={MessageSquare}
              title={ar.dashboard.comments}
              description={ar.dashboard.moderationQueue}
              value={
                pendingCommentsCount > 0
                  ? `${pendingCommentsCount} ${ar.dashboard.pendingReview}`
                  : ar.dashboard.allReviewed
              }
              ctaLabel={ar.dashboard.moderateComments}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <DashboardActionCard
              href="/dashboard/support"
              icon={Mail}
              title={ar.dashboard.support}
              description={ar.dashboard.contactMessages}
              value={ar.dashboard.viewMessages}
              ctaLabel={ar.dashboard.manageSupport}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <DashboardStatCard
              icon={BarChart3}
              title={ar.dashboard.engagementScore}
              value={stats.analytics.engagementScore}
              subLines={[
                `Avg time: ${Math.round(stats.analytics.avgTimeOnPage)}s · Scroll: ${Math.round(stats.analytics.avgScrollDepth)}%`,
              ]}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <DashboardStatCard
              icon={Users}
              title={ar.dashboard.activeUsers}
              value={stats.engagement.activeUsers7d.toLocaleString()}
              subLines={[
                `7d · ${stats.engagement.activeUsers30d.toLocaleString()} (30d)`,
                `Return rate: ${stats.engagement.returnVisitorRate.toFixed(1)}%`,
              ]}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <DashboardStatCard
              icon={Share2}
              title={ar.dashboard.interactions}
              value={
                stats.interactions.totalLikes +
                stats.interactions.totalShares +
                stats.interactions.totalComments
              }
              subLines={[
                `${stats.interactions.totalLikes} ${ar.dashboard.likes} · ${stats.interactions.totalShares} ${ar.dashboard.shares} · ${stats.interactions.totalComments} ${ar.dashboard.commentsLabel}`,
                `${ar.dashboard.rate}: ${stats.interactions.interactionRate.toFixed(1)}%`,
              ]}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <DashboardStatCard
              icon={Target}
              title={ar.dashboard.conversions}
              value={stats.conversions.total}
              subLines={[
                `${ar.dashboard.rate}: ${stats.conversions.rate.toFixed(2)}%`,
                `${ar.dashboard.bounce}: ${stats.analytics.bounceRate.toFixed(1)}%`,
              ]}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="performance-heading" className="space-y-6">
        <h2 id="performance-heading" className="sr-only">
          {ar.dashboard.viewsEngagement}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {ar.dashboard.byViews}
              </CardTitle>
              <CardDescription>{ar.dashboard.topPerforming}</CardDescription>
            </CardHeader>
            <CardContent>
              <TopArticlesChart data={topByViews} metricLabel={ar.dashboard.views} />
              {topByViews.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">{ar.dashboard.noArticles}</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{ar.dashboard.trafficSources}</CardTitle>
              <CardDescription>{ar.dashboard.last30Days}</CardDescription>
            </CardHeader>
            <CardContent>
              <TrafficChart data={trafficSources} />
              {trafficSources.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">{ar.dashboard.noTraffic}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              {ar.analytics.views7d}
            </CardTitle>
            <CardDescription>{ar.dashboard.viewsEngagement}</CardDescription>
          </CardHeader>
          <CardContent>
            <ViewsChart data={viewsOverTime} />
            {viewsOverTime.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">{ar.dashboard.noTraffic}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="activity-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <h2 id="activity-heading" className="sr-only">
          {ar.dashboard.recentActivity}
        </h2>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              {ar.dashboard.byEngagement}
            </CardTitle>
            <CardDescription>{ar.dashboard.score}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-0 divide-y divide-border">
              {topByEngagement.length > 0 ? (
                topByEngagement.map((article) => (
                  <li
                    key={article.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0"
                  >
                    <p className="text-sm font-medium text-foreground truncate flex-1 min-w-0">
                      {article.title}
                    </p>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {ar.dashboard.score}: {article.engagementScore}
                    </span>
                  </li>
                ))
              ) : (
                <li>
                  <p className="text-sm text-muted-foreground py-2">{ar.dashboard.noArticles}</p>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{ar.dashboard.recentActivity}</CardTitle>
            <CardDescription>{ar.dashboard.latestUpdates}</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <ul className="space-y-0 divide-y divide-border" role="list">
                {recentActivity.map((activity, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 py-3 first:pt-0"
                  >
                    <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
                      {activity.type === "article" && <BarChart3 className="h-4 w-4" />}
                      {activity.type === "conversion" && <Target className="h-4 w-4" />}
                      {activity.type === "comment" && <MessageSquare className="h-4 w-4" />}
                      {activity.type === "subscriber" && <Users className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(activity.timestamp).toLocaleDateString()}{" "}
                        {new Date(activity.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-2">{ar.dashboard.noActivity}</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
