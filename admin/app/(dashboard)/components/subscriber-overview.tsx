"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail, UserX, Users } from "lucide-react";
import { format } from "date-fns";

// TODO: DEV REMINDER - Subscriber Overview Component
// This component combines Subscriber Breakdown and Recent Subscribers in one card.
// Consider splitting into separate components if the card becomes too large or if
// individual sections need to be reused elsewhere. Monitor performance with large
// subscriber lists and consider pagination if needed.

interface SubscriberBreakdown {
  total: number;
  active: number;
  unsubscribed: number;
  byClient: Array<{
    clientId: string;
    clientName: string;
    count: number;
  }>;
}

interface RecentSubscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed: boolean;
  subscribedAt: Date;
  createdAt: Date;
  client: { name: string } | null;
}

interface SubscriberOverviewProps {
  breakdown: SubscriberBreakdown;
  recentSubscribers: RecentSubscriber[];
}

export function SubscriberOverview({ breakdown, recentSubscribers }: SubscriberOverviewProps) {
  const percentage = (value: number) => {
    if (breakdown.total === 0) return 0;
    return (value / breakdown.total) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriber Overview</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Breakdown statistics and recent subscriber activity
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
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
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-4">Recent Subscribers</h3>
          {recentSubscribers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscribers yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>{subscriber.name || "-"}</TableCell>
                    <TableCell>{subscriber.client?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={subscriber.subscribed ? "default" : "secondary"}>
                        {subscriber.subscribed ? "Active" : "Unsubscribed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(subscriber.subscribedAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
