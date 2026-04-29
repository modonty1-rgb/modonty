import { ar } from "@/lib/ar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, Calendar, BadgeCheck } from "lucide-react";

export interface SubscriptionData {
  tierName: string;
  status: string | null;
  paymentStatus: string | null;
  startDate: Date | null;
  endDate: Date | null;
  priceSar: number | null;
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}

function statusLabel(status: string | null): {
  label: string;
  classes: string;
} {
  const s = ar.settings;
  const upper = String(status || "").toUpperCase();
  if (upper === "ACTIVE")
    return { label: s.statusActive, classes: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
  if (upper === "EXPIRED")
    return { label: s.statusExpired, classes: "bg-red-100 text-red-700 ring-red-200" };
  if (upper === "CANCELLED" || upper === "CANCELED")
    return { label: s.statusCancelled, classes: "bg-slate-100 text-slate-600 ring-slate-200" };
  return { label: s.statusInactive, classes: "bg-amber-100 text-amber-700 ring-amber-200" };
}

function paymentLabel(payment: string | null): {
  label: string;
  classes: string;
} {
  const s = ar.settings;
  const upper = String(payment || "").toUpperCase();
  if (upper === "PAID")
    return { label: s.paymentPaid, classes: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
  if (upper === "PENDING")
    return { label: s.paymentPending, classes: "bg-amber-100 text-amber-700 ring-amber-200" };
  return { label: s.paymentUnpaid, classes: "bg-red-100 text-red-700 ring-red-200" };
}

function daysBetween(start: Date | null, end: Date | null): {
  daysLeft: number;
  pct: number;
} | null {
  if (!start || !end) return null;
  const now = Date.now();
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (endMs <= startMs) return null;
  const total = endMs - startMs;
  const consumed = Math.max(0, Math.min(total, now - startMs));
  const daysLeft = Math.max(0, Math.ceil((endMs - now) / 86400000));
  const pct = Math.round((consumed / total) * 100);
  return { daysLeft, pct };
}

export function SubscriptionCard({ data }: { data: SubscriptionData }) {
  const s = ar.settings;
  const status = statusLabel(data.status);
  const payment = paymentLabel(data.paymentStatus);
  const progress = daysBetween(data.startDate, data.endDate);

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
