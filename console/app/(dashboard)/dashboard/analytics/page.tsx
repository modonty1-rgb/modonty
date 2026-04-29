import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  getCoreWebVitals,
  getEngagementMetrics,
  getCampaignPerformance,
} from "./helpers/enhanced-analytics-queries";
import { getTopClickedLinks } from "./helpers/link-clicks-queries";
import { getClientViewsAnalytics } from "./helpers/client-views-queries";
import { getTopCTAClicks } from "./helpers/cta-clicks-queries";
import {
  getDeviceBreakdown,
  getNewVsReturning,
  getDayOfWeekPattern,
  getHourOfDayPattern,
  buildInsights,
} from "./helpers/insights-queries";
import {
  Smartphone,
  Tablet,
  Monitor,
  HelpCircle,
  Users,
  Repeat,
  Calendar,
  Clock,
  MousePointerClick,
  Link as LinkIcon,
  Gauge,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ScrollText,
} from "lucide-react";
import { AnalyticsProgressList } from "./components/analytics-progress-list";
import { TimeframeSelector } from "./components/timeframe-selector";

export const dynamic = "force-dynamic";

const VALID_DAYS = [7, 30, 90] as const;
type Days = (typeof VALID_DAYS)[number];

function parseDays(raw: string | string[] | undefined): Days {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  if (VALID_DAYS.includes(n as Days)) return n as Days;
  return 30;
}

function formatAvgTime(seconds: number): string {
  if (seconds <= 0) return "—";
  const minutes = seconds / 60;
  if (minutes < 1) return `${Math.round(seconds)}ث`;
  if (minutes >= 30) return "30+ دقيقة";
  return `${minutes.toFixed(1)} دقيقة`;
}

const DAY_NAMES_SHORT = [
  ar.analytics.daySun,
  ar.analytics.dayMon,
  ar.analytics.dayTue,
  ar.analytics.dayWed,
  ar.analytics.dayThu,
  ar.analytics.dayFri,
  ar.analytics.daySat,
];

interface PageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const params = await searchParams;
  const days = parseDays(params.days);

  const [
    webVitals,
    engagement,
    campaigns,
    topLinks,
    clientViewsData,
    ctaClicks,
    deviceBreakdown,
    newVsReturning,
    dayPattern,
    hourPattern,
  ] = await Promise.all([
    getCoreWebVitals(clientId, days),
    getEngagementMetrics(clientId, days),
    getCampaignPerformance(clientId, days),
    getTopClickedLinks(clientId, days, 10),
    getClientViewsAnalytics(clientId, days),
    getTopCTAClicks(clientId, days, 10),
    getDeviceBreakdown(clientId, days),
    getNewVsReturning(clientId, days),
    getDayOfWeekPattern(clientId, days),
    getHourOfDayPattern(clientId, days),
  ]);

  const a = ar.analytics;
  const insights = buildInsights({
    device: deviceBreakdown,
    newVsReturning,
    dayPattern,
    hourPattern,
    // engagementDuration table is deferred/empty → engagementRate is unreliable.
    // Use bounceRate directly from analytics.bounced flag (real source).
    bounceRate: engagement.bounceRate,
    scrollDepth: engagement.avgScrollDepth,
    timeOnPage: engagement.avgTimeOnPage,
  });

  return (
    <div className="space-y-8">
      {/* ─── Header + Timeframe ──────────────────────────────── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold leading-tight text-foreground">
              {a.title}
            </h1>
            <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">
              {a.pageRolePill}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            {a.comprehensiveAnalytics}
          </p>
        </div>
        <TimeframeSelector value={days} />
      </header>

      {/* ─── 1. Audience Section ─────────────────────────────── */}
      <SectionHeader
        icon={Users}
        title={a.audienceSection}
        subtitle={a.audienceSubtitle}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              {a.deviceTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceBreakdown.length === 0 ? (
              <EmptyHint message={a.noAudience} />
            ) : (
              <ul className="space-y-3">
                {deviceBreakdown.map((d) => (
                  <DeviceRow key={d.type} item={d} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat className="h-4 w-4 text-primary" />
              {a.audienceTypeTitle}
            </CardTitle>
            <CardDescription>{a.audienceTypeHint}</CardDescription>
          </CardHeader>
          <CardContent>
            {newVsReturning.total === 0 ? (
              <EmptyHint message={a.noAudience} />
            ) : (
              <div className="space-y-4">
                <SplitBar
                  leftLabel={a.newVisitors}
                  leftValue={newVsReturning.newVisitors}
                  rightLabel={a.returningVisitors}
                  rightValue={newVsReturning.returningVisitors}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Stat
                    icon={Users}
                    tone="emerald"
                    label={a.newVisitors}
                    value={newVsReturning.newVisitors}
                    hint={`${newVsReturning.newPercentage.toFixed(0)}٪`}
                  />
                  <Stat
                    icon={Repeat}
                    tone="violet"
                    label={a.returningVisitors}
                    value={newVsReturning.returningVisitors}
                    hint={`${(100 - newVsReturning.newPercentage).toFixed(0)}٪`}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── 2. Behavior Section ─────────────────────────────── */}
      <SectionHeader
        icon={ScrollText}
        title={a.behaviorSection}
        subtitle={a.behaviorSubtitle}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat
          icon={Clock}
          tone="primary"
          label={a.timeOnPageTitle}
          value={formatAvgTime(engagement.avgTimeOnPage)}
          hint={a.last30d}
        />
        <Stat
          icon={ScrollText}
          tone="emerald"
          label={a.scrollDepthTitle}
          value={`${engagement.avgScrollDepth.toFixed(0)}٪`}
          hint={a.last30d}
        />
        <Stat
          icon={AlertTriangle}
          tone="amber"
          label={a.bounceRateTitle}
          value={`${engagement.bounceRate.toFixed(1)}٪`}
          hint={a.bounceRateHint}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{a.scrollDepthDistTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.values(engagement.scrollDepthDistribution).every(
            (v) => v === 0
          ) ? (
            <EmptyHint message={a.noTraffic} />
          ) : (
            <ul className="space-y-2">
              {Object.entries(engagement.scrollDepthDistribution).map(
                ([range, percentage]) => (
                  <li
                    key={range}
                    className="flex items-center gap-3 text-xs"
                  >
                    <span className="w-16 shrink-0 text-muted-foreground">
                      {range}٪
                    </span>
                    <div className="h-2 flex-1 min-w-0 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-end tabular-nums text-muted-foreground">
                      {percentage.toFixed(1)}٪
                    </span>
                  </li>
                )
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ─── 3. Timing Section ───────────────────────────────── */}
      <SectionHeader
        icon={Calendar}
        title={a.timingSection}
        subtitle={a.timingSubtitle}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {a.dayOfWeekTitle}
            </CardTitle>
            <CardDescription>{a.dayOfWeekSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            {dayPattern.every((d) => d.views === 0) ? (
              <EmptyHint message={a.noTimingData} />
            ) : (
              <ul className="space-y-2">
                {dayPattern.map((d) => (
                  <li key={d.day} className="flex items-center gap-3 text-sm">
                    <span className="w-14 shrink-0 text-muted-foreground">
                      {DAY_NAMES_SHORT[d.day]}
                    </span>
                    <div className="h-2 flex-1 min-w-0 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-end tabular-nums text-foreground">
                      {d.views}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {a.hourOfDayTitle}
            </CardTitle>
            <CardDescription>{a.hourOfDaySubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            {hourPattern.every((h) => h.views === 0) ? (
              <EmptyHint message={a.noTimingData} />
            ) : (
              <HourHeatmap items={hourPattern} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── 4. Content Engagement Section ───────────────────── */}
      <SectionHeader
        icon={MousePointerClick}
        title={a.contentSection}
        subtitle={a.contentSubtitle}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              {a.topClickedLinks}
            </CardTitle>
            <CardDescription>{a.mostClickedLinks}</CardDescription>
          </CardHeader>
          <CardContent>
            {topLinks.length === 0 ? (
              <EmptyHint message={a.noLinkClickData} />
            ) : (
              <ul className="divide-y divide-border">
                {topLinks.map((link, index) => (
                  <li
                    key={index}
                    className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="break-all text-sm font-medium text-foreground">
                        {link.linkText || link.linkUrl}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {link.linkDomain} · {link.linkType}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-sm font-bold tabular-nums text-foreground">
                        {link.clicks}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {link.uniqueUsers} {a.users}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-primary" />
              {a.topCtaClicks}
            </CardTitle>
            <CardDescription>{a.ctaClicksDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {ctaClicks.items.length === 0 ? (
              <EmptyHint message={a.noCtaData} />
            ) : (
              <ul className="divide-y divide-border">
                {ctaClicks.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.label ?? item.type}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {ctaTypeLabel(item.type)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-end text-sm font-bold tabular-nums text-foreground">
                        {item.clicks}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top referrers */}
      {clientViewsData.topReferrers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{a.topReferrers}</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsProgressList
              items={clientViewsData.topReferrers.map((r) => ({
                label: r.referrer,
                count: r.views,
                percentage:
                  clientViewsData.totalViews > 0
                    ? (r.views / clientViewsData.totalViews) * 100
                    : 0,
              }))}
              emptyMessage={a.noReferrerData}
            />
          </CardContent>
        </Card>
      )}

      {/* ─── 5. Technical Section ────────────────────────────── */}
      <SectionHeader
        icon={Gauge}
        title={a.technicalSection}
        subtitle={a.technicalSubtitle}
      />
      <Card>
        <CardContent className="p-6">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {[
              { label: a.lcp, value: webVitals.lcp, fmt: (v: number) => `${v.toFixed(2)}s` },
              { label: a.cls, value: webVitals.cls, fmt: (v: number) => v.toFixed(3) },
              { label: a.inp, value: webVitals.inp, fmt: (v: number) => `${v.toFixed(0)}ms` },
              { label: a.ttfb, value: webVitals.ttfb, fmt: (v: number) => `${v.toFixed(0)}ms` },
              { label: a.tbt, value: webVitals.tbt, fmt: (v: number) => `${v.toFixed(0)}ms` },
            ].map(({ label, value, fmt }) => (
              <li key={label} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-base font-bold tabular-nums text-foreground">
                  {value != null ? fmt(value) : "—"}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Campaigns (only when present) */}
      {campaigns.length > 0 && (
        <>
          <SectionHeader
            icon={TrendingUp}
            title={a.campaignPerformance}
            subtitle={a.activeCampaigns}
          />
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-4">
                {campaigns.map((campaign) => (
                  <li
                    key={campaign.campaignId}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {campaign.campaignName}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {campaign.type}
                        </p>
                      </div>
                      {campaign.cost != null && (
                        <p className="text-sm font-medium tabular-nums text-foreground">
                          {campaign.cost.toLocaleString()} SAR
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <Mini label={a.impressions} value={campaign.impressions} />
                      <Mini label={a.clicks} value={campaign.clicks} />
                      <Mini label={a.conversions} value={campaign.conversions} />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── 6. Insights Section ─────────────────────────────── */}
      <SectionHeader
        icon={Lightbulb}
        title={a.insightsSection}
        subtitle={a.insightsSubtitle}
      />
      {insights.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyHint message={a.noInsights} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {insights.map((it) => (
            <InsightRow key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="space-y-0.5 pt-2">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </header>
  );
}

function EmptyHint({ message }: { message: string }) {
  return (
    <div className="grid place-items-center py-6 text-center">
      <HelpCircle className="h-6 w-6 text-muted-foreground/50" />
      <p className="mt-2 text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

function DeviceRow({
  item,
}: {
  item: { type: "mobile" | "tablet" | "desktop" | "unknown"; count: number; percentage: number };
}) {
  const a = ar.analytics;
  const map = {
    mobile: { icon: Smartphone, label: a.deviceMobile, color: "text-primary" },
    tablet: { icon: Tablet, label: a.deviceTablet, color: "text-violet-700" },
    desktop: { icon: Monitor, label: a.deviceDesktop, color: "text-emerald-700" },
    unknown: { icon: HelpCircle, label: a.deviceUnknown, color: "text-muted-foreground" },
  } as const;
  const cfg = map[item.type];
  const Icon = cfg.icon;
  return (
    <li className="flex items-center gap-3 text-sm">
      <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
      <span className="w-20 shrink-0 text-foreground">{cfg.label}</span>
      <div className="h-2 flex-1 min-w-0 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${item.percentage}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-end font-bold tabular-nums text-foreground">
        {item.count}
      </span>
      <span className="w-12 shrink-0 text-end tabular-nums text-muted-foreground">
        {item.percentage.toFixed(0)}٪
      </span>
    </li>
  );
}

function SplitBar({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
}) {
  const total = leftValue + rightValue;
  if (total === 0) return null;
  const leftPct = (leftValue / total) * 100;
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${leftPct}%` }}
        />
        <div
          className="h-full bg-violet-500 transition-all"
          style={{ width: `${100 - leftPct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>
          {leftLabel}: {leftValue}
        </span>
        <span>
          {rightLabel}: {rightValue}
        </span>
      </div>
    </div>
  );
}

function HourHeatmap({
  items,
}: {
  items: Array<{ hour: number; views: number; percentage: number }>;
}) {
  const max = Math.max(...items.map((i) => i.views), 1);
  return (
    <div className="grid grid-cols-12 gap-1">
      {items.map((h) => {
        const intensity = h.views / max; // 0..1
        const ampm = h.hour >= 12 ? "م" : "ص";
        const h12 = h.hour % 12 === 0 ? 12 : h.hour % 12;
        return (
          <div
            key={h.hour}
            title={`${h12}${ampm}: ${h.views} مشاهدة`}
            className="grid h-9 place-items-center rounded-md text-[10px] font-bold tabular-nums"
            style={{
              backgroundColor: `rgba(59, 130, 246, ${0.1 + intensity * 0.85})`,
              color: intensity > 0.5 ? "white" : "currentColor",
            }}
          >
            {h12}
          </div>
        );
      })}
    </div>
  );
}

function Stat({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "emerald" | "amber" | "violet";
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary ring-primary/20",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  }[tone];
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${toneClasses}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold leading-tight tabular-nums">{value}</p>
          {hint && (
            <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums text-foreground">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function InsightRow({
  item,
}: {
  item: { id: string; tone: "positive" | "neutral" | "warning"; title: string; detail: string };
}) {
  const map = {
    positive: { icon: CheckCircle2, classes: "border-emerald-200 bg-emerald-50/50 text-emerald-900" },
    neutral: { icon: Lightbulb, classes: "border-primary/20 bg-primary/5 text-foreground" },
    warning: { icon: AlertTriangle, classes: "border-amber-200 bg-amber-50/60 text-amber-900" },
  } as const;
  const cfg = map[item.tone];
  const Icon = cfg.icon;
  return (
    <div className={`rounded-lg border p-4 ${cfg.classes}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed">{item.detail}</p>
        </div>
      </div>
    </div>
  );
}

function ctaTypeLabel(type: string): string {
  const a = ar.analytics;
  const t = String(type || "").toUpperCase();
  if (t === "BUTTON") return a.ctaTypeButton;
  if (t === "LINK") return a.ctaTypeLink;
  if (t === "FORM") return a.ctaTypeForm;
  if (t === "BANNER") return a.ctaTypeBanner;
  if (t === "POPUP") return a.ctaTypePopup;
  return type.replace(/_/g, " ").toLowerCase();
}
