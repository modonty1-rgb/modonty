import { AnalticCard } from "@/components/shared/analtic-card";
import { SEOScoreOverall } from "@/components/shared/seo-doctor";
import type { ClientsStats as ClientsStatsType } from "../actions/clients-actions/types";

interface ClientsStatsProps {
  stats: ClientsStatsType;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function ClientsStats({ stats }: ClientsStatsProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <AnalticCard
        title="Articles"
        value={formatNumber(stats.articles.total)}
        icon="FileText"
        description={`${stats.articles.thisMonth} this month`}
        variant="compact"
      />
      <AnalticCard
        title="Total Views"
        value={formatNumber(stats.views.total)}
        icon="Eye"
        description={`${formatNumber(stats.views.thisMonth)} this month`}
        variant="compact"
      />
      <AnalticCard
        title="Engagement"
        value={`${stats.engagement.engagementScore}%`}
        icon="BarChart3"
        description={`${Math.round(stats.engagement.avgTimeOnPage)}s avg time`}
        variant="compact"
      />
      <AnalticCard
        title="Bounce Rate"
        value={`${stats.engagement.bounceRate}%`}
        icon="TrendingUp"
        description={`${Math.round(stats.engagement.avgScrollDepth)}% scroll`}
        variant="compact"
      />
      <AnalticCard
        title="Organic"
        value={formatNumber(stats.traffic.organic)}
        icon="Search"
        description="Organic search"
        variant="compact"
      />
      <AnalticCard
        title="New Clients"
        value={stats.createdThisMonth}
        icon="Users"
        description={`${stats.growth.newClientsTrend >= 0 ? "+" : ""}${stats.growth.newClientsTrend}% trend`}
        variant="compact"
      />
      <AnalticCard
        title="Delivery"
        value={`${stats.delivery.deliveryRate}%`}
        icon="Package"
        description={`${stats.delivery.totalDelivered}/${stats.delivery.totalPromised}`}
        variant="compact"
      />
      <AnalticCard
        title="Retention"
        value={`${stats.growth.retentionRate}%`}
        icon="Target"
        description={`${stats.withArticles} with content`}
        variant="compact"
      />
      <SEOScoreOverall value={stats.averageSEO} variant="compact" />
    </div>
  );
}
