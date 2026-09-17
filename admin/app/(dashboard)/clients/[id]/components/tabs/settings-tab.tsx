"use client";

import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

import { paymentStateLabel, type ClientPaymentState } from "@/lib/clients/payment-state";

interface SettingsTabProps {
  client: {
    subscriptionStatus: string;
  };
  /** محسوبةٌ من الفواتير على السيرفر — لا تُقرأ من `Client.paymentStatus`. */
  paymentState: ClientPaymentState;
}

export function SettingsTab({ client, paymentState }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">
            Subscription & Billing
          </span>
        </div>
        <div className="p-4 space-y-4">
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
              {/* من الفواتير لا من الكرت. الحقل المخزَّن كان يطبع «PAID» لعميلٍ عليه
                  ثلاث فواتير غير مسدَّدة — ولا شيء يكتب فيه OVERDUE أصلاً. */}
              <Badge
                variant={
                  paymentState.status === "UNPAID"
                    ? "destructive"
                    : paymentState.status === "PAID"
                    ? "default"
                    : "secondary"
                }
              >
                {paymentStateLabel(paymentState)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}