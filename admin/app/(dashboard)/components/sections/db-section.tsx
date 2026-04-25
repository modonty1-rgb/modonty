import Link from "next/link";
import {
  Database,
  FileText,
  Mail,
  Building2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Calendar,
  CreditCard,
  Clock,
} from "lucide-react";

import {
  getDashboardStats,
  getMonthlyDeliveryStats,
  getEngagementQueue,
  getRecentArticles,
  getRecentActivity,
} from "@/app/(dashboard)/actions/dashboard-actions";
import { DashboardSection } from "@/app/(dashboard)/components/dashboard-section";
import { KpiStrip } from "@/app/(dashboard)/components/kpi-strip";
import { MiniActionItems } from "@/app/(dashboard)/components/mini-action-items";
import { MiniActivityFeed } from "@/app/(dashboard)/components/mini-activity-feed";

import type { KpiItem } from "@/app/(dashboard)/components/kpi-strip";
import type { ActionItem } from "@/app/(dashboard)/components/mini-action-items";
import type { ActivityEvent } from "@/app/(dashboard)/components/mini-activity-feed";

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  article_published: <FileText className="h-3.5 w-3.5" />,
  client_created: <Building2 className="h-3.5 w-3.5" />,
  subscription_updated: <Calendar className="h-3.5 w-3.5" />,
  payment_updated: <CreditCard className="h-3.5 w-3.5" />,
};

export async function DbSection() {
  const [stats, delivery, queue, recentArticles, activity] = await Promise.all([
    getDashboardStats(),
    getMonthlyDeliveryStats(),
    getEngagementQueue(),
    getRecentArticles(),
    getRecentActivity(),
  ]);

  const deliveryRate = delivery.summary.totalLimit > 0
    ? Math.round((delivery.summary.totalDelivered / delivery.summary.totalLimit) * 100)
    : 0;

  const totalPending =
    queue.pendingFAQs + queue.pendingComments + queue.newContactMessages;

  const kpis: KpiItem[] = [
    {
      label: "Articles This Month",
      value: (
        <>
          {delivery.summary.totalDelivered}
          <span className="text-base text-muted-foreground font-medium">
            /{delivery.summary.totalLimit}
          </span>
        </>
      ),
      caption: `${delivery.summary.totalClients} active client${delivery.summary.totalClients === 1 ? "" : "s"}`,
      progress: deliveryRate,
      accent: "emerald",
      href: "/articles",
    },
    {
      label: "Active Subscribers",
      value: stats.subscribers.count.toLocaleString("en-US"),
      delta: {
        value: Math.round(stats.subscribers.trend),
        positive: stats.subscribers.trend >= 0,
      },
      accent: "violet",
      href: "/subscribers",
    },
    {
      label: "Active Clients",
      value: stats.clients.count.toLocaleString("en-US"),
      delta: {
        value: Math.round(stats.clients.trend),
        positive: stats.clients.trend >= 0,
      },
      accent: "blue",
      href: "/clients",
    },
    {
      label: "Pending Items",
      value: totalPending,
      caption: `${queue.pendingFAQs} FAQs · ${queue.newContactMessages} msgs · ${queue.pendingComments} comments`,
      accent: totalPending > 0 ? "amber" : "emerald",
    },
  ];

  const actionItems: ActionItem[] = [];
  if (queue.pendingFAQs > 0) {
    actionItems.push({
      severity: "warning",
      icon: <HelpCircle className="h-4 w-4" />,
      title: `${queue.pendingFAQs} FAQ${queue.pendingFAQs === 1 ? "" : "s"} awaiting reply`,
      subtitle: queue.recentPendingFAQs[0]?.article?.title ?? "Questions to answer per article",
      href: "/inbox",
    });
  }
  if (queue.newContactMessages > 0) {
    actionItems.push({
      severity: "info",
      icon: <Mail className="h-4 w-4" />,
      title: `${queue.newContactMessages} new contact message${queue.newContactMessages === 1 ? "" : "s"}`,
      subtitle: queue.recentContactMessages[0]?.subject ?? "From visitors",
      href: "/inbox",
    });
  }
  if (queue.pendingComments > 0) {
    actionItems.push({
      severity: "success",
      icon: <MessageSquare className="h-4 w-4" />,
      title: `${queue.pendingComments} comment${queue.pendingComments === 1 ? "" : "s"} awaiting approval`,
      subtitle: queue.recentPendingComments[0]?.article?.title ?? "Reader comments",
      href: "/articles",
    });
  }

  const events: ActivityEvent[] = activity.slice(0, 4).map((a) => ({
    time: a.timestamp,
    icon: ACTIVITY_ICON[a.type] ?? <Clock className="h-3.5 w-3.5" />,
    title: a.title,
    subtitle:
      "clientName" in a && a.clientName
        ? a.clientName
        : "status" in a && a.status
          ? a.status
          : undefined,
    source: "DB",
    href: a.link,
  }));

  return (
    <DashboardSection
      title="Content & Operations"
      subtitle="Articles · Subscribers · Clients · live"
      icon={<Database className="h-5 w-5" />}
      accent="emerald"
      drillDown={{ href: "/articles", label: "Open Content" }}
    >
      <KpiStrip items={kpis} defaultAccent="emerald" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5">
        {/* Top Articles */}
        <div>
          <h3 className="text-[11px] text-muted-foreground font-bold mb-3 uppercase tracking-wider">
            Recent Articles
          </h3>
          {recentArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No articles yet.</p>
          ) : (
            <div className="space-y-2">
              {recentArticles.slice(0, 5).map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="block p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="text-sm font-medium line-clamp-1">{article.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <span>{article.client?.name ?? "—"}</span>
                    {article.category && (
                      <>
                        <span>·</span>
                        <span>{article.category.name}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className="uppercase">{article.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Action Items */}
        <MiniActionItems
          items={
            actionItems.length > 0
              ? actionItems
              : [
                  {
                    severity: "info",
                    icon: <AlertCircle className="h-4 w-4" />,
                    title: "All caught up",
                    subtitle: "No pending items right now",
                  },
                ]
          }
        />

        {/* Mini Activity */}
        <MiniActivityFeed
          title="Recent Activity"
          events={events}
          emptyMessage="No recent activity."
        />
      </div>
    </DashboardSection>
  );
}
