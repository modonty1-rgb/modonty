import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
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
import { Users, Target, Link as LinkIcon, Eye } from "lucide-react";

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
    getClientViewsAnalytics(clientId, 30),
  ]);

  const a = ar.analytics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {a.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {a.comprehensiveAnalytics}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{a.views7d}</CardTitle>
            <CardDescription className="text-xs">{a.totalPageViews}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {last7.totalViews.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {a.articles}: {last7.articleViews} · {a.client}: {last7.clientViews}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{a.views30d}</CardTitle>
            <CardDescription className="text-xs">{a.totalPageViews}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {last30.totalViews.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {a.articles}: {last30.articleViews} · {a.client}: {last30.clientViews}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{a.engagementRate}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {engagement.engagementRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {a.engaged}: {engagement.engagedSessions} · {a.bounced}: {engagement.bouncedSessions}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{a.conversionRate}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {conversions.rate.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {conversions.total} {a.totalConversions}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{a.trafficSources}</CardTitle>
            <CardDescription>{a.last30d}</CardDescription>
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
              <p className="text-sm text-muted-foreground">{a.noTraffic}</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{a.coreWebVitals}</CardTitle>
            <CardDescription>{a.performanceMetrics}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{a.lcp}</span>
                <span className="text-sm font-medium text-foreground">
                  {webVitals.lcp ? `${webVitals.lcp.toFixed(2)}s` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{a.cls}</span>
                <span className="text-sm font-medium text-foreground">
                  {webVitals.cls ? webVitals.cls.toFixed(3) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{a.inp}</span>
                <span className="text-sm font-medium text-foreground">
                  {webVitals.inp ? `${webVitals.inp.toFixed(0)}ms` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{a.ttfb}</span>
                <span className="text-sm font-medium text-foreground">
                  {webVitals.ttfb ? `${webVitals.ttfb.toFixed(0)}ms` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{a.tbt}</span>
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
            <CardTitle className="text-lg">{a.engagementMetrics}</CardTitle>
            <CardDescription>{a.userBehavior}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{a.timeOnPage}</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(engagement.avgTimeOnPage)}s {a.sAvg}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{a.scrollDepth}</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(engagement.avgScrollDepth)}% {a.percentAvg}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{a.completionRate}</span>
                  <span className="text-sm text-muted-foreground">
                    {engagement.avgCompletionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{a.readingTime}</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(engagement.avgReadingTime)}s {a.sAvg}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">{a.scrollDepthDist}</p>
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
            <CardTitle className="text-lg">{a.conversions}</CardTitle>
            <CardDescription>{a.conversionTypes}</CardDescription>
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
              <p className="text-sm text-muted-foreground">{a.noConversions}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {campaigns.length > 0 && (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{a.campaignPerformance}</CardTitle>
            <CardDescription>{a.activeCampaigns}</CardDescription>
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
                      <p className="text-muted-foreground">{a.impressions}</p>
                      <p className="font-medium text-foreground">
                        {campaign.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{a.clicks}</p>
                      <p className="font-medium text-foreground">{campaign.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{a.conversions}</p>
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
          <CardTitle className="text-lg">{a.topPerformingArticles}</CardTitle>
          <CardDescription>{a.articlesRankedByViews}</CardDescription>
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
                      {article.category ?? "—"} · {article.views.toLocaleString()} {a.views} ·{" "}
                      {Math.round(article.avgTimeOnPage)}s {a.sAvg} · {Math.round(article.avgScrollDepth)}% {a.scroll}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-medium text-foreground">{article.conversions}</p>
                    <p className="text-xs text-muted-foreground">{a.conversions}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{a.noArticles}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">{a.topClickedLinks}</CardTitle>
            </div>
            <CardDescription>{a.mostClickedLinks}</CardDescription>
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
                      <div className="text-end shrink-0">
                        <p className="text-sm font-medium text-foreground">
                          {link.clicks}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {link.uniqueUsers} {a.users}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{a.noLinkClickData}</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">{a.clientPageViews}</CardTitle>
            </div>
            <CardDescription>{a.brandPageAnalytics}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{a.totalClientViews}</span>
                <span className="text-2xl font-semibold text-foreground">
                  {clientViewsData.totalViews.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{a.uniqueVisitors}</span>
                <span className="text-lg font-semibold text-foreground">
                  {clientViewsData.uniqueVisitors.toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">{a.topReferrers}</p>
                <div className="space-y-2">
                  {clientViewsData.topReferrers.length > 0 ? (
                    clientViewsData.topReferrers.map((ref, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate flex-1">
                          {ref.referrer}
                        </span>
                        <span className="text-foreground font-medium ms-2">
                          {ref.views}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">{a.noReferrerData}</p>
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

