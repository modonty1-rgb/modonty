"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Building2,
  CreditCard,
  Calendar,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Activity {
  type:
    | "article_published"
    | "client_created"
    | "subscription_updated"
    | "payment_updated";
  id: string;
  title: string;
  clientName?: string;
  status?: string;
  timestamp: Date;
  link: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const isDev = process.env.NODE_ENV === "development";

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "article_published":
        return <FileText className="h-4 w-4" />;
      case "client_created":
        return <Building2 className="h-4 w-4" />;
      case "subscription_updated":
        return <Calendar className="h-4 w-4" />;
      case "payment_updated":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityLabel = (type: Activity["type"]) => {
    switch (type) {
      case "article_published":
        return "Published article";
      case "client_created":
        return "Created client";
      case "subscription_updated":
        return "Updated subscription";
      case "payment_updated":
        return "Updated payment";
      default:
        return "Activity";
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    if (status === "ACTIVE" || status === "PAID") {
      return <Badge variant="default" className="text-xs">{status}</Badge>;
    }
    if (status === "EXPIRED" || status === "OVERDUE") {
      return <Badge variant="destructive" className="text-xs">{status}</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          {isDev && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md animate-pulse">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-400">
                    ⚠️ DEV REMINDER: Needs Recheck & Enhancement
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                    Subscription/Payment updates are inferred from client updates. Improve accuracy by tracking actual status changes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        {isDev && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md animate-pulse">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-400">
                  ⚠️ DEV REMINDER: Needs Recheck & Enhancement
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                  Subscription/Payment updates are inferred from client updates. Improve accuracy by tracking actual status changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}-${activity.timestamp.getTime()}`}
              className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
            >
              <div className="mt-0.5 text-muted-foreground">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">
                    {getActivityLabel(activity.type)}
                  </span>
                  <Link
                    href={activity.link}
                    className="text-sm font-medium hover:text-primary truncate"
                  >
                    {activity.title}
                  </Link>
                  {activity.clientName && activity.type === "article_published" && (
                    <span className="text-sm text-muted-foreground">
                      for {activity.clientName}
                    </span>
                  )}
                  {getStatusBadge(activity.status)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{format(new Date(activity.timestamp), "MMM d, h:mm a")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
