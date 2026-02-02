"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Package, CreditCard, Clock } from "lucide-react";

interface SubscriptionTabProps {
  client: {
    subscriptionTier: string | null;
    subscriptionStartDate: Date | null;
    subscriptionEndDate: Date | null;
    articlesPerMonth: number | null;
    subscriptionTierConfig?: {
      id: string;
      tier: string;
      name: string;
      articlesPerMonth: number;
      price: number;
      isPopular: boolean;
    } | null;
    subscriptionStatus: string;
    paymentStatus: string;
  };
}

const getTierName = (tier: string | null): string => {
  if (!tier) return "Not Set";
  switch (tier) {
    case "BASIC":
      return "Basic";
    case "STANDARD":
      return "Standard";
    case "PRO":
      return "Pro";
    case "PREMIUM":
      return "Premium";
    default:
      return tier;
  }
};

export function SubscriptionTab({ client }: SubscriptionTabProps) {
  const now = new Date();
  const getSubscriptionDaysRemaining = () => {
    if (!client.subscriptionEndDate) return null;
    const endDate = new Date(client.subscriptionEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getSubscriptionDaysRemaining();
  const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription & Billing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {client.subscriptionTier && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Subscription Tier</p>
                </div>
                <Badge variant="outline" className="text-sm">
                  {getTierName(client.subscriptionTier)}
                </Badge>
              </div>
            )}
            {(client.articlesPerMonth !== null || client.subscriptionTierConfig) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Articles Per Month</p>
                </div>
                <p className="text-sm font-medium">
                  {client.articlesPerMonth !== null
                    ? client.articlesPerMonth
                    : client.subscriptionTierConfig?.articlesPerMonth || 0}
                </p>
              </div>
            )}
          </div>

          {client.subscriptionStartDate && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Subscription Start Date</p>
              </div>
              <p className="text-sm font-medium">{format(new Date(client.subscriptionStartDate), "MMM d, yyyy")}</p>
            </div>
          )}

          {client.subscriptionEndDate && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Subscription End Date</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium">{format(new Date(client.subscriptionEndDate), "MMM d, yyyy")}</p>
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
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Subscription Status</p>
              </div>
              <Badge
                variant={
                  client.subscriptionStatus === "ACTIVE"
                    ? "default"
                    : client.subscriptionStatus === "EXPIRED"
                      ? "destructive"
                      : "secondary"
                }
              >
                {client.subscriptionStatus}
              </Badge>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Payment Status</p>
              </div>
              <Badge
                variant={
                  client.paymentStatus === "PAID"
                    ? "default"
                    : client.paymentStatus === "OVERDUE"
                      ? "destructive"
                      : "secondary"
                }
              >
                {client.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
