import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  Users2,
  Mail,
  Plus,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Edit,
  Eye,
  Archive,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
} from "lucide-react";
import {
  getDashboardStats,
  getRecentArticles,
  getStatusBreakdown,
  getSubscriptionHealth,
  getDashboardAlerts,
  getMonthlyDeliveryStats,
  getRecentActivity,
  getEngagementQueue,
  getVisitorEngagementStats,
} from "./actions/dashboard-actions";
import { DashboardAlertsBanner } from "./components/dashboard-alerts-banner";
import { SubscriptionHealthCard } from "./components/subscription-health-card";
import { EngagementQueue } from "./components/engagement-queue";
import { VisitorEngagementCard } from "./components/visitor-engagement-card";
import { format, formatDistanceToNow } from "date-fns";

// ─── helpers ──────────────────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: number }) {
  if (trend === 0) return <span className="text-[10px] text-muted-foreground">No change</span>;
  const positive = trend > 0;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${positive ? "text-emerald-500" : "text-red-500"}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive && "+"}{Math.abs(trend).toFixed(0)}% vs last period
    </span>
  );
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; bar: string }> = {
  WRITING:   { label: "Writing",   color: "bg-violet-500/15 text-violet-600 border-violet-500/20",  icon: <Edit      className="h-3 w-3" />, bar: "bg-violet-500" },
  DRAFT:     { label: "Draft",     color: "bg-slate-500/15  text-slate-500  border-slate-500/20",   icon: <FileText  className="h-3 w-3" />, bar: "bg-slate-400" },
  SCHEDULED: { label: "Scheduled", color: "bg-amber-500/15  text-amber-600  border-amber-500/20",   icon: <Calendar  className="h-3 w-3" />, bar: "bg-amber-500" },
  PUBLISHED: { label: "Published", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", icon: <Eye     className="h-3 w-3" />, bar: "bg-emerald-500" },
  ARCHIVED:  { label: "Archived",  color: "bg-stone-500/15  text-stone-500  border-stone-500/20",   icon: <Archive   className="h-3 w-3" />, bar: "bg-stone-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [
    stats,
    recentArticles,
    statusBreakdown,
    subscriptionHealth,
    alerts,
    deliveryStats,
    recentActivity,
    engagementQueue,
    visitorEngagement,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentArticles(),
    getStatusBreakdown(),
    getSubscriptionHealth(),
    getDashboardAlerts(),
    getMonthlyDeliveryStats(),
    getRecentActivity(),
    getEngagementQueue(),
    getVisitorEngagementStats(),
  ]);

  const deliveryRate = deliveryStats.summary.totalLimit > 0
    ? Math.round((deliveryStats.summary.totalDelivered / deliveryStats.summary.totalLimit) * 100)
    : 0;

  const today = new Date();

  return (
    <div className="px-6 py-6 max-w-[1280px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(today, "EEEE, MMM d, yyyy")}
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5 shrink-0">
          <Link href="/articles/new">
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      {/* ── Alert chips — only when needed ── */}
      <DashboardAlertsBanner alerts={alerts} />

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Active Clients */}
        <Card className="border-0 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 ring-1 ring-indigo-500/20">
          <CardContent className="pt-4 pb-4 px-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-600/80">Active Clients</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 tabular-nums leading-none">
              {stats.clients.count}
            </div>
            <TrendBadge trend={stats.clients.trend} />
          </CardContent>
        </Card>

        {/* Delivered This Month */}
        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 ring-1 ring-emerald-500/20">
          <CardContent className="pt-4 pb-4 px-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600/80">Delivered This Month</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums leading-none">
              {deliveryStats.summary.totalDelivered}
              <span className="text-base font-medium text-emerald-600/60 ml-1">
                / {deliveryStats.summary.totalLimit}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600/70 font-medium">articles this month</span>
          </CardContent>
        </Card>

        {/* Delivery Rate */}
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5 ring-1 ring-amber-500/20">
          <CardContent className="pt-4 pb-4 px-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600/80">Delivery Rate</span>
              <div className="h-7 w-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-700 dark:text-amber-400 tabular-nums leading-none">
              {deliveryRate}%
            </div>
            <div className="w-full bg-amber-500/15 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${deliveryRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Subscribers */}
        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-violet-500/5 ring-1 ring-violet-500/20">
          <CardContent className="pt-4 pb-4 px-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-violet-600/80">Active Subscribers</span>
              <div className="h-7 w-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Mail className="h-4 w-4 text-violet-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-violet-700 dark:text-violet-400 tabular-nums leading-none">
              {stats.subscribers.count}
            </div>
            <TrendBadge trend={stats.subscribers.trend} />
          </CardContent>
        </Card>
      </div>

      {/* ── Visitor Engagement Queue ── */}
      <EngagementQueue
        pendingComments={engagementQueue.pendingComments}
        newContactMessages={engagementQueue.newContactMessages}
        pendingFAQs={engagementQueue.pendingFAQs}
        views={engagementQueue.views}
        recentPendingComments={engagementQueue.recentPendingComments}
        recentContactMessages={engagementQueue.recentContactMessages}
        recentPendingFAQs={engagementQueue.recentPendingFAQs}
      />

      {/* ── Main 60/40 grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── LEFT 60% ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Monthly Delivery Progress */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Monthly Delivery Progress</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {deliveryStats.summary.totalClients} active client{deliveryStats.summary.totalClients !== 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {deliveryStats.stats.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active clients with article quotas.</p>
              ) : (
                deliveryStats.stats.map((stat) => {
                  const pct = stat.articlesPerMonth > 0
                    ? Math.round((stat.articlesDelivered / stat.articlesPerMonth) * 100)
                    : 0;
                  const isAtLimit = stat.isAtLimit;
                  const nearLimit = pct >= 80 && !isAtLimit;

                  return (
                    <div key={stat.clientId} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/clients/${stat.clientId}`}
                          className="text-sm font-medium hover:text-primary truncate"
                        >
                          {stat.clientName}
                        </Link>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {stat.articlesDelivered} / {stat.articlesPerMonth}
                          </span>
                          <span className={`text-xs font-bold tabular-nums ${isAtLimit ? "text-red-600" : nearLimit ? "text-amber-600" : "text-emerald-600"}`}>
                            {pct}%
                          </span>
                          {isAtLimit && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 text-[9px] font-medium">
                              <AlertTriangle className="h-2.5 w-2.5" />Limit
                            </span>
                          )}
                        </div>
                      </div>
                      <Progress
                        value={pct}
                        className={`h-2 ${isAtLimit ? "[&>div]:bg-red-500" : nearLimit ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}`}
                      />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Articles — status breakdown + recent list */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Articles</CardTitle>
                <Link href="/articles" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5">
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* status bars */}
              <div className="grid grid-cols-5 gap-2">
                {(["WRITING", "DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"] as const).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const count = statusBreakdown[s.toLowerCase() as keyof typeof statusBreakdown] as number;
                  return (
                    <Link
                      key={s}
                      href={`/articles?status=${s}`}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors text-center"
                    >
                      <span className={`text-xl font-bold tabular-nums leading-none ${cfg.bar.replace("bg-", "text-")}`}>
                        {count}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-medium">{cfg.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* recent article list */}
              <div className="divide-y divide-border/50">
                {recentArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No articles yet.</p>
                ) : (
                  recentArticles.map((article) => (
                    <div key={article.id} className="py-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <Link
                          href={`/articles/${article.id}`}
                          className="text-sm font-medium hover:text-primary line-clamp-1"
                        >
                          {article.title}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span>{article.client?.name ?? "—"}</span>
                          {article.category && (
                            <>
                              <span>·</span>
                              <span>{article.category.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={article.status} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          {/* Visitor Engagement */}
          <VisitorEngagementCard
            totals={visitorEngagement.totals}
            today={visitorEngagement.today}
            week={visitorEngagement.week}
            sharesByPlatform={visitorEngagement.sharesByPlatform}
            topSharedArticles={visitorEngagement.topSharedArticles}
          />

        </div>

        {/* ── RIGHT 40% ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { label: "New Article",  href: "/articles/new",          icon: <Plus        className="h-3.5 w-3.5" />, primary: true },
                { label: "New Client",   href: "/clients/new",           icon: <Building2   className="h-3.5 w-3.5" /> },
                { label: "Media",        href: "/media",                 icon: <Eye         className="h-3.5 w-3.5" /> },
                { label: "SEO Overview", href: "/seo-overview",          icon: <FileText    className="h-3.5 w-3.5" /> },
                { label: "Subscribers",  href: "/subscribers",           icon: <Mail        className="h-3.5 w-3.5" /> },
                { label: "Admins",       href: "/users",                 icon: <Users2      className="h-3.5 w-3.5" /> },
              ].map(({ label, href, icon, primary }) => (
                <Button
                  key={href}
                  asChild
                  variant={primary ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-xs h-8 gap-1.5"
                >
                  <Link href={href}>
                    {icon}
                    {label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Subscription Health */}
          <SubscriptionHealthCard
            subscriptions={subscriptionHealth.subscriptions}
            payments={subscriptionHealth.payments}
            expiring={subscriptionHealth.expiring}
          />

          {/* Activity Feed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                <div className="space-y-0">
                  {recentActivity.slice(0, 8).map((activity, i) => {
                    const iconMap: Record<string, React.ReactNode> = {
                      article_published:   <FileText  className="h-3.5 w-3.5 text-emerald-500" />,
                      client_created:      <Building2 className="h-3.5 w-3.5 text-indigo-500"  />,
                      subscription_updated:<Calendar  className="h-3.5 w-3.5 text-amber-500"   />,
                      payment_updated:     <CreditCard className="h-3.5 w-3.5 text-violet-500" />,
                    };
                    return (
                      <div
                        key={`${activity.type}-${activity.id}-${i}`}
                        className="flex items-start gap-2.5 py-2 border-b border-border/40 last:border-0"
                      >
                        <div className="mt-0.5 shrink-0">{iconMap[activity.type] ?? <Clock className="h-3.5 w-3.5 text-muted-foreground" />}</div>
                        <div className="min-w-0 flex-1">
                          <Link href={activity.link} className="text-xs font-medium hover:text-primary line-clamp-1">
                            {activity.title}
                          </Link>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </div>
                        </div>
                        {"status" in activity && activity.status && (
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border shrink-0 ${
                            activity.status === "ACTIVE" || activity.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : activity.status === "EXPIRED" || activity.status === "OVERDUE"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
