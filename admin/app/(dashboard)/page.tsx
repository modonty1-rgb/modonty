import {
  getDashboardStats,
  getRecentArticles,
  getStatusBreakdown,
  getSubscriptionHealth,
  getDashboardAlerts,
  getMonthlyDeliveryStats,
  getClientHealth,
  getRecentActivity,
  getArticlesTrendData,
  getClientGrowthTrendData,
  getRecentSubscribers,
  getSubscriberStats,
  getSubscriberGrowthTrendData,
} from "./actions/dashboard-actions";
import { AnalticCard } from "@/components/shared/analtic-card";
import { ArticlesOverview } from "./components/articles-overview";
import { SubscriberOverview } from "./components/subscriber-overview";
import { SubscriberGrowthChart } from "./components/subscriber-growth-chart";
import { AlertsSection } from "./components/alerts-section";
import { QuickActions } from "./components/quick-actions";
import { DeliveryProgress } from "./components/delivery-progress";
import { ClientHealthOverview } from "./components/client-health-overview";
import { ActivityFeed } from "./components/activity-feed";
import { SubscriptionStatusChart } from "./components/subscription-status-chart";
import { PaymentStatusChart } from "./components/payment-status-chart";
import { SubscriptionTierChart } from "./components/subscription-tier-chart";
import { ArticlesTrendChart } from "./components/articles-trend-chart";
import { ClientGrowthChart } from "./components/client-growth-chart";
import { DeliveryProgressChart } from "./components/delivery-progress-chart";
import { TierCards } from "./subscription-tiers/components/tier-cards";
import { getTierConfigs } from "./subscription-tiers/actions/tier-actions";

export default async function DashboardPage() {
  const [
    stats,
    recentArticles,
    statusBreakdown,
    subscriptionHealth,
    alerts,
    deliveryStats,
    clientHealth,
    recentActivity,
    articlesTrend,
    clientGrowthTrend,
    tierConfigs,
    recentSubscribers,
    subscriberStats,
    subscriberGrowthTrend,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentArticles(),
    getStatusBreakdown(),
    getSubscriptionHealth(),
    getDashboardAlerts(),
    getMonthlyDeliveryStats(),
    getClientHealth(),
    getRecentActivity(),
    getArticlesTrendData(),
    getClientGrowthTrendData(),
    getTierConfigs(),
    getRecentSubscribers(),
    getSubscriberStats(),
    getSubscriberGrowthTrendData(),
  ]);

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to the admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalticCard
          title="Total Articles"
          value={stats.articles}
          icon="FileText"
          description="All articles in the system"
        />
        <AnalticCard
          title="Clients"
          value={stats.clients}
          icon="Building2"
          description="Active clients"
        />
        <AnalticCard
          title="Users"
          value={stats.users}
          icon="Users"
          description="Registered users"
        />
        <AnalticCard
          title="Subscribers"
          value={stats.subscribers}
          icon="Mail"
          description="Newsletter subscribers"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalticCard
          title="Active Subscriptions"
          value={subscriptionHealth.subscriptions.active}
          icon="Building2"
          description="Clients with active subscriptions"
        />
        <AnalticCard
          title="Expiring Soon"
          value={subscriptionHealth.expiring.in7Days}
          icon="Calendar"
          description="Subscriptions expiring in 7 days"
        />
        <AnalticCard
          title="Overdue Payments"
          value={subscriptionHealth.payments.overdue}
          icon="CreditCard"
          description="Clients with overdue payments"
        />
        <AnalticCard
          title="Expired Subscriptions"
          value={subscriptionHealth.subscriptions.expired}
          icon="AlertTriangle"
          description="Subscriptions that have expired"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
        <TierCards tiers={tierConfigs} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AlertsSection alerts={alerts} />
          <ArticlesOverview breakdown={statusBreakdown} recentArticles={recentArticles} />
          <SubscriberOverview breakdown={subscriberStats} recentSubscribers={recentSubscribers} />
          <ClientHealthOverview health={clientHealth} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubscriptionStatusChart data={subscriptionHealth.subscriptions} />
            <PaymentStatusChart data={subscriptionHealth.payments} />
          </div>
          
          <SubscriptionTierChart data={subscriptionHealth.tierDistribution} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ArticlesTrendChart data={articlesTrend} />
            <ClientGrowthChart data={clientGrowthTrend} />
          </div>
          <SubscriberGrowthChart data={subscriberGrowthTrend} />
          
          <DeliveryProgressChart stats={deliveryStats.stats} />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <DeliveryProgress
            stats={deliveryStats.stats}
            summary={deliveryStats.summary}
          />
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}
