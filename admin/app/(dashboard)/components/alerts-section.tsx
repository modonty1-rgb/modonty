"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CreditCard,
  Calendar,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

interface AlertData {
  expiringSubscriptions: Array<{
    id: string;
    name: string;
    subscriptionEndDate: Date | null;
  }>;
  overduePayments: Array<{
    id: string;
    name: string;
    paymentStatus: string;
  }>;
  expiredSubscriptions: Array<{
    id: string;
    name: string;
    subscriptionStatus: string;
  }>;
  clientsAtLimit: Array<{
    id: string;
    name: string;
    articlesPerMonth: number | null;
    articlesThisMonth: number;
    isAtLimit: boolean;
  }>;
}

interface AlertsSectionProps {
  alerts: AlertData;
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  const hasAlerts =
    alerts.expiringSubscriptions.length > 0 ||
    alerts.overduePayments.length > 0 ||
    alerts.expiredSubscriptions.length > 0 ||
    alerts.clientsAtLimit.length > 0;

  if (!hasAlerts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Alerts & Warnings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No client alerts at this time. All systems operating normally.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Alerts & Warnings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.expiringSubscriptions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Expiring Subscriptions ({alerts.expiringSubscriptions.length})
                </span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clients?filter=expiring">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              {alerts.expiringSubscriptions.slice(0, 3).map((client) => (
                <Alert key={client.id} variant="default">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">
                    {client.name}
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    Expires{" "}
                    {client.subscriptionEndDate
                      ? format(new Date(client.subscriptionEndDate), "MMM d, yyyy")
                      : "soon"}
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 ml-2 text-xs"
                      asChild
                    >
                      <Link href={`/clients/${client.id}`}>View</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {alerts.overduePayments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">
                  Overdue Payments ({alerts.overduePayments.length})
                </span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clients?filter=overdue">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              {alerts.overduePayments.slice(0, 3).map((client) => (
                <Alert key={client.id} variant="destructive">
                  <CreditCard className="h-4 w-4" />
                  <AlertTitle className="text-sm">{client.name}</AlertTitle>
                  <AlertDescription className="text-xs">
                    Payment overdue
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 ml-2 text-xs"
                      asChild
                    >
                      <Link href={`/clients/${client.id}`}>View</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {alerts.expiredSubscriptions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">
                  Expired Subscriptions ({alerts.expiredSubscriptions.length})
                </span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clients?filter=expired">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              {alerts.expiredSubscriptions.slice(0, 3).map((client) => (
                <Alert key={client.id} variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm">{client.name}</AlertTitle>
                  <AlertDescription className="text-xs">
                    Subscription expired - article creation blocked
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 ml-2 text-xs"
                      asChild
                    >
                      <Link href={`/clients/${client.id}`}>View</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {alerts.clientsAtLimit.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Clients at Article Limit ({alerts.clientsAtLimit.length})
                </span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clients?filter=at-limit">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              {alerts.clientsAtLimit.slice(0, 3).map((client) => (
                <Alert key={client.id} variant="default">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">{client.name}</AlertTitle>
                  <AlertDescription className="text-xs">
                    {client.articlesThisMonth} / {client.articlesPerMonth} articles
                    this month
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 ml-2 text-xs"
                      asChild
                    >
                      <Link href={`/clients/${client.id}`}>View</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
