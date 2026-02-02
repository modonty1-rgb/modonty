"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalticCard } from "@/components/shared/analtic-card";
import {
  Building2,
  AlertTriangle,
  TrendingUp,
  Users,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

interface ClientHealthData {
  activeClients: number;
  clientsNeedingAttention: Array<{
    id: string;
    name: string;
    subscriptionStatus: string;
    paymentStatus: string;
    subscriptionEndDate: Date | null;
  }>;
  topClientsByArticles: Array<{
    id: string;
    name: string;
    articleCount: number;
  }>;
  growthTrend: number;
}

interface ClientHealthOverviewProps {
  health: ClientHealthData;
}

export function ClientHealthOverview({ health }: ClientHealthOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalticCard
          title="Active Clients"
          value={health.activeClients}
          icon={Building2}
          description="Clients with active subscriptions"
          trend={health.growthTrend}
        />
        <AnalticCard
          title="Needs Attention"
          value={health.clientsNeedingAttention.length}
          icon={AlertTriangle}
          description="Clients requiring immediate action"
        />
      </div>

      {health.clientsNeedingAttention.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Clients Needing Attention</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clients?filter=attention">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {health.clientsNeedingAttention.slice(0, 5).map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {client.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      {client.subscriptionStatus === "EXPIRED" && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                      {client.subscriptionStatus === "ACTIVE" &&
                        client.subscriptionEndDate && (
                          <Badge variant="outline">
                            Expires{" "}
                            {format(
                              new Date(client.subscriptionEndDate),
                              "MMM d"
                            )}
                          </Badge>
                        )}
                      {client.paymentStatus === "OVERDUE" && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/clients/${client.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {health.topClientsByArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {health.topClientsByArticles.map((client, index) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {index + 1}
                    </div>
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {client.name}
                    </Link>
                  </div>
                  <Badge variant="secondary">{client.articleCount} articles</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
