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
import { getTopClickedLinks } from "./helpers/link-clicks-queries";
import { getClientViewsAnalytics } from "./helpers/client-views-queries";
import { getTopCTAClicks } from "./helpers/cta-clicks-queries";
import { Users, Target, Link as LinkIcon, Eye, BarChart3, Gauge, Activity, MousePointerClick } from "lucide-react";
import { AnalyticsStatCard } from "./components/analytics-stat-card";
import { AnalyticsProgressList } from "./components/analytics-progress-list";

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
    ctaClicks,
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
    getTopCTAClicks(clientId, 30, 10),
  ]);

  const a = ar.analytics;

  return (
    <div className="space-y-8">
      <section aria-labelledby="analytics-heading">
        <div className="mb-6">
          <h1 id="analytics-heading" className="text-2xl font-semibold leading-tight text-foreground">
            {a.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {a.comprehensiveAnalytics}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsStatCard
            icon={BarChart3}
            title={a.views7d}
            description={a.totalPageViews}
            value={last7.totalViews.toLocaleString()}
            subLines={[`${a.articles}: ${last7.articleViews} · ${a.client}: ${last7.clientViews}`]}
          />
          <AnalyticsStatCard
            icon={BarChart3}
            title={a.views30d}
            description={a.totalPageViews}
            value={last30.totalViews.toLocaleString()}
            subLines={[`${a.articles}: ${last30.articleViews} · ${a.client}: ${last30.clientViews}`]}
          />
          <AnalyticsStatCard
            icon={Users}
            title={a.engagementRate}
            value={`${engagement.engagementRate.toFixed(1)}%`}
            subLines={[`${a.engaged}: ${engagement.engagedSessions} · ${a.bounced}: ${engagement.bouncedSessions}`]}
          />
          <AnalyticsStatCard
            icon={Target}
            title={a.conversionRate}
            value={`${conversions.rate.toFixed(2)}%`}
            subLines={[`${conversions.total} ${a.totalConversions}`]}
          />
        </div>
      </section>

      <section aria-labelledby="traffic-performance-heading" className="space-y-6">
        <h2 id="traffic-performance-heading" className="sr-only">
          {a.trafficSources} · {a.coreWebVitals}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                {a.trafficSources}
              </CardTitle>
              <CardDescription>{a.last30d}</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsProgressList
                items={trafficSources.map((s) => ({
                  label: s.source,
                  count: s.count,
                  percentage: s.percentage,
                }))}
                emptyMessage={a.noTraffic}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                {a.coreWebVitals}
              </CardTitle>
              <CardDescription>{a.performanceMetrics}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-0 divide-y divide-border" role="list">
                {[
                  { key: "lcp", label: a.lcp, value: webVitals.lcp, fmt: (v: number) => `${v.toFixed(2)}s` },
                  { key: "cls", label: a.cls, value: webVitals.cls, fmt: (v: number) => v.toFixed(3) },
                  { key: "inp", label: a.inp, value: webVitals.inp, fmt: (v: number) => `${v.toFixed(0)}ms` },
                  { key: "ttfb", label: a.ttfb, value: webVitals.ttfb, fmt: (v: number) => `${v.toFixed(0)}ms` },
                  { key: "tbt", label: a.tbt, value: webVitals.tbt, fmt: (v: number) => `${v.toFixed(0)}ms` },
                ].map(({ key, label, value, fmt }) => (
                  <li key={key} className="flex items-center justify-between py-3 first:pt-0">
                    <span className="text-sm text-foreground">{label}</span>
                    <span className="text-sm font-medium text-foreground tabular-nums">
                      {value != null ? fmt(value) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="engagement-conversions-heading" className="space-y-6">
        <h2 id="engagement-conversions-heading" className="sr-only">
          {a.engagementMetrics} · {a.conversions}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                {a.engagementMetrics}
              </CardTitle>
              <CardDescription>{a.userBehavior}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-0 divide-y divide-border" role="list">
                {[
                  { label: a.timeOnPage, value: `${Math.round(engagement.avgTimeOnPage)}s ${a.sAvg}` },
                  { label: a.scrollDepth, value: `${Math.round(engagement.avgScrollDepth)}% ${a.percentAvg}` },
                  { label: a.completionRate, value: `${engagement.avgCompletionRate.toFixed(1)}%` },
                  { label: a.readingTime, value: `${Math.round(engagement.avgReadingTime)}s ${a.sAvg}` },
                ].map(({ label, value }) => (
                  <li key={label} className="flex items-center justify-between py-3 first:pt-0">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">{value}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 mt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">{a.scrollDepthDist}</p>
                <ul className="space-y-2" role="list">
                  {Object.entries(engagement.scrollDepthDistribution).map(([range, percentage]) => (
                    <li key={range} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-muted-foreground shrink-0">{range}%</span>
                      <div className="flex-1 min-w-0 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                          role="presentation"
                        />
                      </div>
                      <span className="text-muted-foreground tabular-nums shrink-0">{percentage.toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                {a.conversions}
              </CardTitle>
              <CardDescription>{a.conversionTypes}</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsProgressList
                items={conversions.conversions.map((c) => ({
                  label: c.type,
                  count: c.count,
                  percentage: c.percentage,
                }))}
                emptyMessage={a.noConversions}
                formatLabel={(l) => l.replace(/_/g, " ").toLowerCase()}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {campaigns.length > 0 && (
        <section aria-labelledby="campaigns-heading">
          <h2 id="campaigns-heading" className="sr-only">{a.campaignPerformance}</h2>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                {a.campaignPerformance}
              </CardTitle>
              <CardDescription>{a.activeCampaigns}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4" role="list">
                {campaigns.map((campaign) => (
                  <li
                    key={campaign.campaignId}
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{campaign.campaignName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{campaign.type}</p>
                      </div>
                      {campaign.cost != null && (
                        <p className="text-sm font-medium text-foreground tabular-nums">
                          {campaign.cost.toLocaleString()} SAR
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{a.impressions}</p>
                        <p className="font-medium text-foreground tabular-nums">
                          {campaign.impressions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{a.clicks}</p>
                        <p className="font-medium text-foreground tabular-nums">
                          {campaign.clicks.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{a.conversions}</p>
                        <p className="font-medium text-foreground tabular-nums">
                          {campaign.conversions.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      <section aria-labelledby="content-performance-heading" className="space-y-6">
        <h2 id="content-performance-heading" className="sr-only">
          {a.topPerformingArticles} · {a.topClickedLinks} · {a.clientPageViews}
        </h2>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              {a.topPerformingArticles}
            </CardTitle>
            <CardDescription>{a.articlesRankedByViews}</CardDescription>
          </CardHeader>
          <CardContent>
            {topArticles.length > 0 ? (
              <ul className="space-y-0 divide-y divide-border" role="list">
                {topArticles.map((article) => (
                  <li
                    key={article.articleId}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {article.category ?? "—"} · {article.views.toLocaleString()} {a.views} ·{" "}
                        {Math.round(article.avgTimeOnPage)}s {a.sAvg} · {Math.round(article.avgScrollDepth)}% {a.scroll}
                      </p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-sm font-medium text-foreground tabular-nums">{article.conversions}</p>
                      <p className="text-xs text-muted-foreground">{a.conversions}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{a.noArticles}</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                {a.topClickedLinks}
              </CardTitle>
              <CardDescription>{a.mostClickedLinks}</CardDescription>
            </CardHeader>
            <CardContent>
              {topLinks.length > 0 ? (
                <ul className="space-y-0 divide-y divide-border" role="list">
                  {topLinks.map((link, index) => (
                    <li key={index} className="py-3 first:pt-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground break-all">
                            {link.linkText || link.linkUrl}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {link.linkDomain} · {link.linkType}
                          </p>
                        </div>
                        <div className="text-end shrink-0">
                          <p className="text-sm font-medium text-foreground tabular-nums">{link.clicks}</p>
                          <p className="text-xs text-muted-foreground">{link.uniqueUsers} {a.users}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{a.noLinkClickData}</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                {a.clientPageViews}
              </CardTitle>
              <CardDescription>{a.brandPageAnalytics}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-0 divide-y divide-border" role="list">
                <li className="flex items-center justify-between py-3 first:pt-0">
                  <span className="text-sm font-medium text-foreground">{a.totalClientViews}</span>
                  <span className="text-2xl font-semibold text-foreground tabular-nums">
                    {clientViewsData.totalViews.toLocaleString()}
                  </span>
                </li>
                <li className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-foreground">{a.uniqueVisitors}</span>
                  <span className="text-lg font-semibold text-foreground tabular-nums">
                    {clientViewsData.uniqueVisitors.toLocaleString()}
                  </span>
                </li>
              </ul>
              <div className="pt-4 mt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">{a.topReferrers}</p>
                {clientViewsData.topReferrers.length > 0 ? (
                  <ul className="space-y-2" role="list">
                    {clientViewsData.topReferrers.map((ref, index) => (
                      <li key={index} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground truncate min-w-0">{ref.referrer}</span>
                        <span className="text-foreground font-medium tabular-nums shrink-0">{ref.views}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">{a.noReferrerData}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="cta-clicks-heading">
        <h2 id="cta-clicks-heading" className="sr-only">{a.topCtaClicks}</h2>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-primary" />
              {a.topCtaClicks}
            </CardTitle>
            <CardDescription>{a.ctaClicksDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {ctaClicks.items.length > 0 ? (
              <ul className="space-y-0 divide-y divide-border" role="list">
                {ctaClicks.items.map((item, index) => (
                  <li key={index} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.label ?? item.type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {item.type.replace(/_/g, " ").toLowerCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${item.percentage}%` }}
                          role="presentation"
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground tabular-nums w-8 text-end">
                        {item.clicks}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{a.noCtaData}</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

