"use client";

import { AnalticCard } from "@/components/shared/analtic-card";
import { ClientDeliveryMetrics } from "../client-delivery-metrics";
import { Eye, FileText, TrendingUp, Users, TrendingDown, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OverviewTabProps {
  client: {
    subscriptionTier?: string | null;
    subscriptionStatus: string;
    subscriptionStartDate: Date | null;
    subscriptionEndDate: Date | null;
    articlesPerMonth: number | null;
    subscriptionTierConfig?: {
      articlesPerMonth: number;
      price: number;
      tier: string;
    } | null;
    _count: {
      articles: number;
    };
  };
  articlesThisMonth: number;
  totalArticles: number;
  analytics: {
    totalViews: number;
    uniqueSessions: number;
    avgTimeOnPage: number;
    bounceRate: number;
    avgScrollDepth: number;
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function OverviewTab({
  client,
  articlesThisMonth,
  totalArticles,
  analytics,
}: OverviewTabProps) {
  const engagementScore = Math.round(
    (Math.min(analytics.avgTimeOnPage / 120, 1) * 50 + Math.min(analytics.avgScrollDepth / 100, 1) * 50)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <AnalticCard
          title="Total Views"
          value={formatNumber(analytics.totalViews)}
          icon={Eye}
          description="All time"
        />
        <AnalticCard
          title="Sessions"
          value={formatNumber(analytics.uniqueSessions)}
          icon={Users}
          description="Unique visitors"
        />
        <AnalticCard
          title="Articles"
          value={formatNumber(totalArticles)}
          icon={FileText}
          description={`${articlesThisMonth} this month`}
        />
        <AnalticCard
          title="Engagement"
          value={`${engagementScore}%`}
          icon={TrendingUp}
          description={`${Math.round(analytics.avgTimeOnPage)}s avg time`}
        />
        <AnalticCard
          title="Bounce Rate"
          value={`${analytics.bounceRate.toFixed(1)}%`}
          icon={TrendingDown}
          description={`${analytics.avgScrollDepth.toFixed(0)}% scroll`}
        />
        <AnalticCard
          title="Time on Page"
          value={`${Math.round(analytics.avgTimeOnPage)}s`}
          icon={Eye}
          description="Average"
        />
      </div>

      <ClientDeliveryMetrics
        client={client}
        articlesThisMonth={articlesThisMonth}
        totalArticles={totalArticles}
      />

      <Card className="border-muted bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-1">Summary View</p>
              <p className="text-sm text-muted-foreground">
                This is a high-level overview of key metrics. For detailed analytics including traffic sources, top performing articles, and channel breakdowns, visit the{" "}
                <span className="font-medium text-foreground">Analytics</span> tab.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
