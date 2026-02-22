import Link from "next/link";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {ar.nav.dashboard}
        </h1>
        <p className="text-muted-foreground mt-1">
          {ar.dashboard.welcome}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{ar.dashboard.subscribers}</CardTitle>
            <CardDescription className="text-xs">{ar.dashboard.newsletterList}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">
              {stats.content.totalSubscribers}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{ar.dashboard.totalSubscribers}</p>
          </CardContent>
        </Card>

        <Link href="/dashboard/articles">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-medium">{ar.dashboard.articles}</CardTitle>
              </div>
              <CardDescription className="text-xs">{ar.dashboard.manageApprove}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {pendingCount > 0 ? (
                  <>
                    {pendingCount} {ar.dashboard.pendingApproval}
                  </>
                ) : (
                  ar.dashboard.allApproved
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1 underline underline-offset-4">
                {ar.dashboard.manageApprove} →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">{ar.dashboard.analytics}</CardTitle>
              <CardDescription className="text-xs">{ar.dashboard.viewsEngagement}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {stats.analytics.views7d.toLocaleString()} {ar.dashboard.views} ({ar.analytics.views7d})
              </p>
              <p className="text-xs text-muted-foreground mt-1 underline underline-offset-4">
                {ar.dashboard.viewAnalytics} →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/comments">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-medium">{ar.dashboard.comments}</CardTitle>
              </div>
              <CardDescription className="text-xs">{ar.dashboard.moderationQueue}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {pendingCommentsCount > 0 ? (
                  <>
                    {pendingCommentsCount} {ar.dashboard.pendingReview}
                  </>
                ) : (
                  ar.dashboard.allReviewed
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1 underline underline-offset-4">
                {ar.dashboard.moderateComments} →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/support">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-medium">{ar.dashboard.support}</CardTitle>
              </div>
              <CardDescription className="text-xs">{ar.dashboard.contactMessages}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {ar.dashboard.viewMessages}
              </p>
              <p className="text-xs text-muted-foreground mt-1 underline underline-offset-4">
                {ar.dashboard.manageSupport} →
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{ar.dashboard.engagementScore}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.analytics.engagementScore}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg time: {Math.round(stats.analytics.avgTimeOnPage)}s · Scroll:{" "}
              {Math.round(stats.analytics.avgScrollDepth)}%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{ar.dashboard.activeUsers}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.engagement.activeUsers7d.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              7d · {stats.engagement.activeUsers30d.toLocaleString()} (30d)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Return rate: {stats.engagement.returnVisitorRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{ar.dashboard.interactions}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">
              {stats.interactions.totalLikes + stats.interactions.totalShares + stats.interactions.totalComments}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.interactions.totalLikes} {ar.dashboard.likes} · {stats.interactions.totalShares} {ar.dashboard.shares} ·{" "}
              {stats.interactions.totalComments} {ar.dashboard.commentsLabel}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ar.dashboard.rate}: {stats.interactions.interactionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{ar.dashboard.conversions}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.conversions.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ar.dashboard.rate}: {stats.conversions.rate.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ar.dashboard.bounce}: {stats.analytics.bounceRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
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
            <BarChart3 className="h-4 w-4" />
            {ar.dashboard.views} (7 أيام)
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {ar.dashboard.byEngagement}
            </CardTitle>
            <CardDescription>{ar.dashboard.score}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topByEngagement.length > 0 ? (
                topByEngagement.map((article) => (
                  <li
                    key={article.id}
                    className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0"
                  >
                    <p className="text-sm font-medium text-foreground truncate flex-1 min-w-0">
                      {article.title}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {ar.dashboard.score}: {article.engagementScore}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{ar.dashboard.noArticles}</p>
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
            <ul className="space-y-3">
              {recentActivity.map((activity, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="mt-0.5">
                    {activity.type === "article" && <BarChart3 className="h-4 w-4 text-primary" />}
                    {activity.type === "conversion" && <Target className="h-4 w-4 text-primary" />}
                    {activity.type === "comment" && <MessageSquare className="h-4 w-4 text-primary" />}
                    {activity.type === "subscriber" && <Users className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
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
            <p className="text-sm text-muted-foreground">{ar.dashboard.noActivity}</p>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
