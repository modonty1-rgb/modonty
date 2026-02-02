import { getAnalyticsData, getViewsTrendData } from "./actions/analytics-actions";
import { AnalyticsCharts } from "./components/analytics-charts";
import { ViewsChart } from "./components/views-chart";
import { TrafficSourcesChart } from "./components/traffic-sources-chart";
import { TopArticlesChart } from "./components/top-articles-chart";
import { DateRangeFilter } from "./components/date-range-filter";
import { AnalyticsPageClient } from "./components/analytics-page-client";

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsData();
  const viewsTrend = await getViewsTrendData();

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">View analytics and metrics for your content</p>
        </div>
      </div>
      
      <AnalyticsPageClient
        initialAnalytics={analytics}
        initialViewsTrend={viewsTrend}
      />
    </div>
  );
}
