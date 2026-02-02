"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryStats {
  clientId: string;
  clientName: string;
  articlesPerMonth: number;
  articlesDelivered: number;
  remaining: number;
  isAtLimit: boolean;
}

interface DeliveryProgressProps {
  stats: DeliveryStats[];
  summary: {
    totalDelivered: number;
    totalLimit: number;
    clientsAtLimit: number;
    totalClients: number;
  };
}

export function DeliveryProgress({
  stats,
  summary,
}: DeliveryProgressProps) {
  const overallProgress =
    summary.totalLimit > 0
      ? (summary.totalDelivered / summary.totalLimit) * 100
      : 0;
  
  const overallRemaining = summary.totalLimit - summary.totalDelivered;
  const overallPercentage = Math.round(overallProgress);

  const getStatusColor = (progress: number, isAtLimit: boolean) => {
    if (isAtLimit) return "destructive";
    if (progress >= 90) return "destructive";
    if (progress >= 75) return "default";
    return "default";
  };

  const getStatusIcon = (progress: number, isAtLimit: boolean, remaining: number) => {
    if (isAtLimit) return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
    if (progress >= 90) return <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />;
    if (remaining === 0) return <CheckCircle2 className="h-3.5 w-3.5 text-primary" />;
    return <TrendingUp className="h-3.5 w-3.5 text-primary" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Delivery Progress</CardTitle>
            <CardDescription className="mt-1">
              Current month delivery status across all clients
            </CardDescription>
          </div>
          {summary.clientsAtLimit > 0 && (
            <Badge variant="destructive" className="text-xs">
              {summary.clientsAtLimit} at limit
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Overall Progress</div>
              <div className="text-xs text-muted-foreground">
                {summary.totalClients} active clients
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-2xl font-bold">{overallPercentage}%</div>
              <div className="text-xs text-muted-foreground">
                {summary.totalDelivered} / {summary.totalLimit} articles
              </div>
            </div>
          </div>
          <Progress 
            value={overallProgress} 
            className={cn(
              "h-3",
              overallProgress >= 90 ? "bg-destructive/20" : ""
            )} 
          />
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Delivered this month:</span>
              <span className="font-medium">{summary.totalDelivered} articles</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total monthly limit:</span>
              <span className="font-medium">{summary.totalLimit} articles</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Remaining capacity:</span>
              <span className={cn(
                "font-medium",
                overallRemaining === 0 ? "text-primary" : "text-foreground"
              )}>
                {overallRemaining > 0 ? `${overallRemaining} articles` : "All delivered"}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Delivered:</strong> Articles published or scheduled this month (based on <code className="text-xs bg-muted px-1 py-0.5 rounded">datePublished</code> for PUBLISHED, <code className="text-xs bg-muted px-1 py-0.5 rounded">scheduledAt</code> for SCHEDULED). <strong>Source:</strong> Real-time database queries.{" "}
              <strong>Limit:</strong> Sum of all active clients' <code className="text-xs bg-muted px-1 py-0.5 rounded">articlesPerMonth</code> values stored in database. Tier limits are configured in <code className="text-xs bg-muted px-1 py-0.5 rounded">SubscriptionTierConfig</code> collection and can be managed via Subscription Tiers admin page.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Client Breakdown</div>
            <div className="text-xs text-muted-foreground">
              Showing top {Math.min(5, stats.length)} of {stats.length}
            </div>
          </div>
          <div className="space-y-3">
            {stats.slice(0, 5).map((stat) => {
              const progress =
                stat.articlesPerMonth > 0
                  ? (stat.articlesDelivered / stat.articlesPerMonth) * 100
                  : 0;
              const percentage = Math.round(progress);
              const isNearLimit = progress >= 90 && !stat.isAtLimit;

              return (
                <div 
                  key={stat.clientId} 
                  className={cn(
                    "p-3 rounded-lg border space-y-2.5 transition-colors",
                    stat.isAtLimit 
                      ? "bg-destructive/5 border-destructive/20" 
                      : isNearLimit
                      ? "bg-muted/50 border-muted"
                      : "bg-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(progress, stat.isAtLimit, stat.remaining)}
                        <Link
                          href={`/clients/${stat.clientId}`}
                          className="font-medium text-sm hover:text-primary truncate"
                        >
                          {stat.clientName}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{stat.articlesDelivered} delivered</span>
                        <span>•</span>
                        <span>{stat.remaining} remaining</span>
                        <span>•</span>
                        <span className="font-medium">{stat.articlesPerMonth} limit</span>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className={cn(
                        "text-sm font-bold",
                        stat.isAtLimit ? "text-destructive" : percentage >= 90 ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {percentage}%
                      </div>
                      {stat.isAtLimit && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                          Limit
                        </Badge>
                      )}
                      {isNearLimit && !stat.isAtLimit && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          Near Limit
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={progress}
                    className={cn(
                      "h-2",
                      stat.isAtLimit 
                        ? "bg-destructive/20" 
                        : isNearLimit
                        ? "bg-muted/30"
                        : ""
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {stats.length > 5 && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/clients?view=delivery">
              View All {stats.length} Clients
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
