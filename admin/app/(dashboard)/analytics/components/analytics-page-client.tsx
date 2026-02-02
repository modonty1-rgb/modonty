"use client";

import { useState, useTransition } from "react";
import { AnalticCard } from "@/components/shared/analtic-card";
import { AnalyticsCharts } from "./analytics-charts";
import { ViewsChart } from "./views-chart";
import { TrafficSourcesChart } from "./traffic-sources-chart";
import { TopArticlesChart } from "./top-articles-chart";
import { DateRangeFilter } from "./date-range-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnalyticsData, getViewsTrendData } from "../actions/analytics-actions";

type TopArticle = {
  articleId: string;
  title: string;
  client: string;
  views: number;
};

type AnalyticsData = {
  totalViews: number;
  uniqueSessions: number;
  avgTimeOnPage: number;
  bounceRate: number;
  avgScrollDepth: number;
  topArticles: TopArticle[];
  trafficSources: Record<string, number>;
  channelSummary?: Record<
    string,
    {
      views: number;
      sessions: number;
      avgTimeOnPage: number;
      bounceRate: number;
      avgScrollDepth: number;
    }
  >;
};

type ViewsTrendData = {
  date: string;
  views: number;
  sessions: number;
}[];

interface AnalyticsPageClientProps {
  initialAnalytics: AnalyticsData;
  initialViewsTrend: ViewsTrendData;
}

export function AnalyticsPageClient({
  initialAnalytics,
  initialViewsTrend,
}: AnalyticsPageClientProps) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [viewsTrend, setViewsTrend] = useState(initialViewsTrend);
  const [isPending, startTransition] = useTransition();

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    startTransition(async () => {
      try {
        const [newAnalytics, newTrend] = await Promise.all([
          getAnalyticsData({
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          }),
          getViewsTrendData({
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          }),
        ]);

        setAnalytics(newAnalytics);
        setViewsTrend(newTrend);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
      </div>

      {isPending ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <AnalticCard
              title="Total Views"
              value={analytics.totalViews}
            />
            <AnalticCard
              title="Unique Sessions"
              value={analytics.uniqueSessions}
            />
            <AnalticCard
              title="Avg Time on Page"
              value={`${analytics.avgTimeOnPage}s`}
            />
            <AnalticCard
              title="Bounce Rate"
              value={`${analytics.bounceRate.toFixed(1)}%`}
            />
            <AnalticCard
              title="Avg Scroll Depth"
              value={`${analytics.avgScrollDepth.toFixed(0)}%`}
            />
          </div>

          <ViewsChart data={viewsTrend} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrafficSourcesChart data={analytics.trafficSources} />
            <TopArticlesChart data={analytics.topArticles} />
          </div>

          <AnalyticsCharts
            topArticles={analytics.topArticles}
            trafficSources={analytics.trafficSources}
            channelSummary={analytics.channelSummary}
          />
        </>
      )}
    </>
  );
}
