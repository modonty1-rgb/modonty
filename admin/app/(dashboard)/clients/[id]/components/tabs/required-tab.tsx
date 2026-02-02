"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link2, Mail, Package, Calendar, Clock, CreditCard } from "lucide-react";
import Link from "next/link";

interface RequiredTabProps {
  client: {
    id: string;
    name: string;
    slug: string;
    email: string;
    businessBrief: string | null;
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
    _count: {
      articles: number;
    };
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

export function RequiredTab({ client }: RequiredTabProps) {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="text-sm font-medium">{client.name}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Slug</p>
              </div>
              <p className="font-mono text-sm">{client.slug}</p>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Email</p>
              </div>
              {client.email ? (
                <a
                  href={`mailto:${client.email}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {client.email}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Brief</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {client.businessBrief || <span className="text-muted-foreground italic">Not set</span>}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
