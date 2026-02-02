import Link from "next/link";
import { auth } from "@/lib/auth";
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
  getRecentActivity,
} from "./helpers/dashboard-queries";
import { getPendingArticlesCount } from "./articles/helpers/article-queries";
import { getPendingCommentsCount } from "./comments/helpers/comment-queries";
import { BarChart3, TrendingUp, Users, Share2, MessageSquare, Target, FileText, Image as ImageIcon, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const [stats, topByViews, topByEngagement, topByConversions, trafficSources, recentActivity, pendingCount, pendingCommentsCount] =
    await Promise.all([
      getDashboardStats(clientId),
      getTopArticles(clientId, "views", 5),
      getTopArticles(clientId, "engagement", 5),
      getTopArticles(clientId, "conversions", 5),
      getTrafficSources(clientId, 30),
      getRecentActivity(clientId, 10),
      getPendingArticlesCount(clientId),
      getPendingCommentsCount(clientId),
    ]);

  const quotaProgress =
    stats.content.monthlyQuota > 0
      ? (stats.content.monthlyPublished / stats.content.monthlyQuota) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Here's your performance overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Subscription</CardTitle>
            <CardDescription className="text-xs">Current plan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">{stats.subscription.tierName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.subscription.status} · {stats.subscription.paymentStatus}
            </p>
            {stats.subscription.price && (
              <p className="text-xs text-muted-foreground mt-1">
                {stats.subscription.price.toLocaleString()} SAR/year
              </p>
            )}
          </CardContent>
        </Card>

        <Link href="/dashboard/content">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Content</CardTitle>
              <CardDescription className="text-xs">Articles this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {stats.content.monthlyPublished}
                {stats.content.monthlyQuota > 0 && ` / ${stats.content.monthlyQuota}`}
              </p>
              {stats.content.monthlyQuota > 0 && (
                <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, quotaProgress)}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 underline underline-offset-4">
                View content →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Subscribers</CardTitle>
            <CardDescription className="text-xs">Newsletter list</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">
              {stats.content.totalSubscribers}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total subscribers</p>
          </CardContent>
        </Card>

        <Link href="/dashboard/articles">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-medium">Articles</CardTitle>
              </div>
              <CardDescription className="text-xs">Manage & approve</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {pendingCount > 0 ? (
                  <>
                    {pendingCount} pending approval
                  </>
                ) : (
                  "All approved"
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1 underline underline-offset-4">
                Manage articles →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Analytics</CardTitle>
              <CardDescription className="text-xs">Views & engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {stats.analytics.views7d.toLocaleString()} views (7d)
              </p>
              <p className="text-xs text-muted-foreground mt-1 underline underline-offset-4">
                View analytics →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/comments">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-medium">Comments</CardTitle>
              </div>
              <CardDescription className="text-xs">Moderation queue</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {pendingCommentsCount > 0 ? (
                  <>
                    {pendingCommentsCount} pending review
                  </>
                ) : (
                  "All reviewed"
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1 underline underline-offset-4">
                Moderate comments →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/media">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-medium">Media</CardTitle>
              </div>
              <CardDescription className="text-xs">Assets & branding</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                Manage library
              </p>
              <p className="text-xs text-muted-foreground mt-1 underline underline-offset-4">
                View media →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/support">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-medium">Support</CardTitle>
              </div>
              <CardDescription className="text-xs">Contact messages</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                View messages
              </p>
              <p className="text-xs text-muted-foreground mt-1 underline underline-offset-4">
                Manage support →
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
              <CardTitle className="text-base font-medium">Engagement Score</CardTitle>
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
              <CardTitle className="text-base font-medium">Active Users</CardTitle>
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
              <CardTitle className="text-base font-medium">Interactions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">
              {stats.interactions.totalLikes + stats.interactions.totalShares + stats.interactions.totalComments}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.interactions.totalLikes} likes · {stats.interactions.totalShares} shares ·{" "}
              {stats.interactions.totalComments} comments
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Rate: {stats.interactions.interactionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Conversions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.conversions.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Rate: {stats.conversions.rate.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Bounce: {stats.analytics.bounceRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Articles</CardTitle>
            <CardDescription>By views, engagement, and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  By Views
                </h4>
                <ul className="space-y-2">
                  {topByViews.length > 0 ? (
                    topByViews.map((article) => (
                      <li
                        key={article.id}
                        className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {article.category ?? "—"} · {article.views.toLocaleString()} views
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No articles yet.</p>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  By Engagement
                </h4>
                <ul className="space-y-2">
                  {topByEngagement.length > 0 ? (
                    topByEngagement.map((article) => (
                      <li
                        key={article.id}
                        className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Score: {article.engagementScore} · {article.views.toLocaleString()} views
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No articles yet.</p>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Traffic Sources</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {trafficSources.length > 0 ? (
              <div className="space-y-3">
                {trafficSources.map((source) => (
                  <div key={source.source} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground capitalize">
                        {source.source.toLowerCase()}
                      </span>
                      <span className="text-muted-foreground">
                        {source.count.toLocaleString()} ({source.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No traffic data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest updates and events</CardDescription>
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
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
