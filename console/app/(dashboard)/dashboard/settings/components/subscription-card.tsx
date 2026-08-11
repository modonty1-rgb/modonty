import { ar } from "@/lib/ar";
import {
  statusLabel,
  paymentLabel,
  subscriptionProgress,
  formatSubscriptionDate as formatDate,
  type SubscriptionData,
} from "@/lib/subscription";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, Calendar, BadgeCheck } from "lucide-react";

export function SubscriptionCard({ data }: { data: SubscriptionData }) {
  const s = ar.settings;
  const status = statusLabel(data.status);
  const payment = paymentLabel(data.paymentStatus);
  const progress = subscriptionProgress(data.startDate, data.endDate);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-4 w-4 text-primary" />
          {s.subscriptionTitle}
        </CardTitle>
        <CardDescription>{s.subscriptionHint}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-2xl font-bold leading-tight tracking-tight">
              {data.tierName}
            </p>
            {data.priceSar != null && (
              <p className="text-xs text-muted-foreground tabular-nums">
                {new Intl.NumberFormat("en-GB").format(data.priceSar)} SAR / {s.perYear}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${status.classes}`}
            >
              <BadgeCheck className="h-3 w-3" />
              {status.label}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${payment.classes}`}
            >
              {payment.label}
            </span>
          </div>
        </div>

        {progress && (
          <div className="space-y-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 tabular-nums">
                <Calendar className="h-3 w-3" />
                {progress.daysLeft} {s.daysLeft}
              </span>
              <span className="tabular-nums">
                {formatDate(data.startDate)} → {formatDate(data.endDate)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
