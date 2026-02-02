"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Code } from "lucide-react";

interface SettingsTabProps {
  client: {
    subscriptionStatus: string;
    paymentStatus: string;
    gtmId: string | null;
  };
}

export function SettingsTab({ client }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription & Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {client.gtmId && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Google Tag Manager ID</p>
              </div>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                {client.gtmId}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}