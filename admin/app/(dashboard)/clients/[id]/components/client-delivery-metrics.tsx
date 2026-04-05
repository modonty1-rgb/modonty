"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { AnalticCard } from "@/components/shared/analtic-card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getSubscriptionDaysRemaining, calculateDeliveryRate } from "../../helpers/client-display-utils";

interface ClientDeliveryMetricsProps {
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
}

export function ClientDeliveryMetrics({
  client,
  articlesThisMonth,
  totalArticles,
}: ClientDeliveryMetricsProps) {
  const promisedArticles =
    client.articlesPerMonth ?? client.subscriptionTierConfig?.articlesPerMonth ?? 0;
  const deliveredArticles = articlesThisMonth;
  const deliveryRate = calculateDeliveryRate(promisedArticles, deliveredArticles);
  const isBehind = deliveredArticles < promisedArticles;

  const daysRemaining = getSubscriptionDaysRemaining(client.subscriptionEndDate);
  const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Delivery & Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <AnalticCard
            title="This Month"
            value={deliveredArticles}
            icon={Package}
            description={`${promisedArticles} promised`}
          />
          <AnalticCard
            title="Delivery Rate"
            value={`${deliveryRate}%`}
            icon={TrendingUp}
            description={isBehind ? "Behind schedule" : "On track"}
          />
          <AnalticCard
            title="Total Articles"
            value={totalArticles}
            icon={Package}
            description="All time"
          />
          <AnalticCard
            title="Monthly Target"
            value={promisedArticles}
            icon={Calendar}
            description="Articles per month"
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Current Month Progress</span>
            </div>
            <Badge variant={isBehind ? "destructive" : "default"}>
              {deliveredArticles}/{promisedArticles}
            </Badge>
          </div>

          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out",
                isBehind ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${Math.min(deliveryRate, 100)}%` }}
            />
          </div>

          {isBehind && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">
                {promisedArticles - deliveredArticles} article{promisedArticles - deliveredArticles !== 1 ? "s" : ""} behind schedule this month
              </p>
            </div>
          )}

          {client.subscriptionEndDate && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Subscription Expires</span>
              </div>
              <div className="flex items-center gap-2">
                {daysRemaining !== null && (
                  <Badge
                    variant={
                      daysRemaining <= 0
                        ? "destructive"
                        : isExpiringSoon
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {daysRemaining > 0
                      ? `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left`
                      : "Expired"}
                  </Badge>
                )}
                <span className="text-sm font-medium">
                  {format(new Date(client.subscriptionEndDate), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
