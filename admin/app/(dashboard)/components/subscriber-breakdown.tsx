"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, UserX, Users } from "lucide-react";

interface SubscriberBreakdownProps {
  breakdown: {
    total: number;
    active: number;
    unsubscribed: number;
    byClient: Array<{
      clientId: string;
      clientName: string;
      count: number;
    }>;
  };
}

export function SubscriberBreakdown({ breakdown }: SubscriberBreakdownProps) {
  const percentage = (value: number) => {
    if (breakdown.total === 0) return 0;
    return (value / breakdown.total) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriber Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Total Subscribers</span>
            </div>
            <span className="font-medium">{breakdown.total}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{breakdown.active}</span>
              <span className="text-muted-foreground text-xs">
                ({percentage(breakdown.active).toFixed(0)}%)
              </span>
            </div>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${percentage(breakdown.active)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-muted-foreground" />
              <span>Unsubscribed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{breakdown.unsubscribed}</span>
              <span className="text-muted-foreground text-xs">
                ({percentage(breakdown.unsubscribed).toFixed(0)}%)
              </span>
            </div>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-muted-foreground h-full transition-all"
              style={{ width: `${percentage(breakdown.unsubscribed)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
