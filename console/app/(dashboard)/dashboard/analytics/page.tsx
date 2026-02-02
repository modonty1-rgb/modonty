import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getClientViewCounts } from "./helpers/analytics-queries";
import {
  getTrafficSources,
  getCoreWebVitals,
  getEngagementMetrics,
  getConversions,
  getCampaignPerformance,
  getArticlePerformance,
} from "./helpers/enhanced-analytics-queries";
import { getTopClickedLinks, getLinkClickStats } from "./helpers/link-clicks-queries";
import { getClientViewsAnalytics } from "./helpers/client-views-queries";
import { Activity, TrendingUp, Users, Target, Zap, Globe, Link as LinkIcon, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const [
    last7,
    last30,
    trafficSources,
    webVitals,
    engagement,
    conversions,
    campaigns,
    topArticles,
    topLinks,
    linkStats,
    clientViewsData,
  ] = await Promise.all([
    getClientViewCounts(clientId, 7),
    getClientViewCounts(clientId, 30),
    getTrafficSources(clientId, 30),
    getCoreWebVitals(clientId, 30),
    getEngagementMetrics(clientId, 30),
    getConversions(clientId, 30),
    getCampaignPerformance(clientId, 30),
    getArticlePerformance(clientId, 30, 10),
    getTopClickedLinks(clientId, 30, 10),
    getLinkClickStats(clientId, 30),
    getClientViewsAnalytics(clientId, 30),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive analytics and performance insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Views (7d)</CardTitle>
            <CardDescription className="text-xs">Total page views</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {last7.totalViews.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Articles: {last7.articleViews} · Client: {last7.clientViews}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Views (30d)</CardTitle>
            <CardDescription className="text-xs">Total page views</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {last30.totalViews.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Articles: {last30.articleViews} · Client: {last30.clientViews}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Engagement Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {engagement.engagementRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Engaged: {engagement.engagedSessions} · Bounced: {engagement.bouncedSessions}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Conversion Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {conversions.rate.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {conversions.total} total conversions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Core Web Vitals</CardTitle>
            <CardDescription>Performance metrics (30d average)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">LCP (Largest Contentful Paint)</span>
                <span className="text-sm font-medium text-foreground">
                  {webVitals.lcp ? `${webVitals.lcp.toFixed(2)}s` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">CLS (Cumulative Layout Shift)</span>
                <span className="text-sm font-medium text-foreground">
                  {webVitals.cls ? webVitals.cls.toFixed(3) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">INP (Interaction to Next Paint)</span>
                <span className="text-sm font-medium text-foreground">
                  {webVitals.inp ? `${webVitals.inp.toFixed(0)}ms` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">TTFB (Time to First Byte)</span>
                <span className="text-sm font-medium text-foreground">
                  {webVitals.ttfb ? `${webVitals.ttfb.toFixed(0)}ms` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">TBT (Total Blocking Time)</span>
                <span className="text-sm font-medium text-foreground">
                  {webVitals.tbt ? `${webVitals.tbt.toFixed(0)}ms` : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Engagement Metrics</CardTitle>
            <CardDescription>User behavior and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Time on Page</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(engagement.avgTimeOnPage)}s avg
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Scroll Depth</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(engagement.avgScrollDepth)}% avg
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Completion Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {engagement.avgCompletionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Reading Time</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(engagement.avgReadingTime)}s avg
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">Scroll Depth Distribution</p>
                <div className="space-y-2">
                  {Object.entries(engagement.scrollDepthDistribution).map(([range, percentage]) => (
                    <div key={range} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{range}%</span>
                      <div className="flex-1 mx-2 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Conversions</CardTitle>
            <CardDescription>Conversion types and performance</CardDescription>
          </CardHeader>
          <CardContent>
            {conversions.conversions.length > 0 ? (
              <div className="space-y-3">
                {conversions.conversions.map((conv) => (
                  <div key={conv.type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground capitalize">
                        {conv.type.replace(/_/g, " ").toLowerCase()}
                      </span>
                      <span className="text-muted-foreground">
                        {conv.count} ({conv.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${conv.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No conversions yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {campaigns.length > 0 && (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Campaign Performance</CardTitle>
            <CardDescription>Active campaigns and their performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.campaignId}
                  className="p-3 border border-border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{campaign.campaignName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{campaign.type}</p>
                    </div>
                    {campaign.cost && (
                      <p className="text-sm font-medium text-foreground">
                        {campaign.cost.toLocaleString()} SAR
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Impressions</p>
                      <p className="font-medium text-foreground">
                        {campaign.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Clicks</p>
                      <p className="font-medium text-foreground">{campaign.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversions</p>
                      <p className="font-medium text-foreground">
                        {campaign.conversions.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Articles</CardTitle>
          <CardDescription>Articles ranked by views (30d)</CardDescription>
        </CardHeader>
        <CardContent>
          {topArticles.length > 0 ? (
            <div className="space-y-3">
              {topArticles.map((article) => (
                <div
                  key={article.articleId}
                  className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {article.category ?? "—"} · {article.views.toLocaleString()} views ·{" "}
                      {Math.round(article.avgTimeOnPage)}s avg · {Math.round(article.avgScrollDepth)}%
                      scroll
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground">{article.conversions}</p>
                    <p className="text-xs text-muted-foreground">conversions</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No articles yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Top Clicked Links</CardTitle>
            </div>
            <CardDescription>Most clicked links in articles (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            {topLinks.length > 0 ? (
              <div className="space-y-3">
                {topLinks.map((link, index) => (
                  <div
                    key={index}
                    className="py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground break-all">
                          {link.linkText || link.linkUrl}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {link.linkDomain} · {link.linkType}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-foreground">
                          {link.clicks}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {link.uniqueUsers} users
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No link click data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Client Page Views</CardTitle>
            </div>
            <CardDescription>Brand page and profile analytics (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Client Page Views</span>
                <span className="text-2xl font-semibold text-foreground">
                  {clientViewsData.totalViews.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Unique Visitors</span>
                <span className="text-lg font-semibold text-foreground">
                  {clientViewsData.uniqueVisitors.toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">Top Referrers</p>
                <div className="space-y-2">
                  {clientViewsData.topReferrers.length > 0 ? (
                    clientViewsData.topReferrers.map((ref, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate flex-1">
                          {ref.referrer}
                        </span>
                        <span className="text-foreground font-medium ml-2">
                          {ref.views}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No referrer data</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

