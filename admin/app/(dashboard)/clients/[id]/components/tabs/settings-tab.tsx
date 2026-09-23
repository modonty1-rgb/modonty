"use client";

import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

// من ملفّ الكلمة لا من فهرس المجلّد: الفهرسُ يجرّ `db` إلى حزمة المتصفّح.
import { paymentStateLabel, paymentStateTone } from "@/lib/clients/payment-state/payment-state-label";
import type { ClientPaymentState } from "@/lib/clients/payment-state/get-payment-states";

interface SettingsTabProps {
  client: {
    subscriptionStatus: string;
  };
  /** محسوبةٌ على السيرفر من الطلب الساري والمستحقّات — لا تُقرأ من `Client.paymentStatus`. */
  paymentState: ClientPaymentState;
}

const TONE_VARIANT = { stop: "destructive", go: "default", muted: "secondary" } as const;

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
              {/* الكلمةُ واللونُ من `payment-state-label.ts` — نفسُ شارة الشرائح والتصدير. */}
              <Badge variant={TONE_VARIANT[paymentStateTone(paymentState)]}>
                {paymentStateLabel(paymentState)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}