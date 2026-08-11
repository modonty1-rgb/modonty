import { ar } from "@/lib/ar";

/**
 * Subscription state, derived once and read by both the settings card and the sidebar
 * block. The two show the same plan; deriving the days and the percentage twice is how
 * they end up disagreeing by a day.
 */
export interface SubscriptionData {
  tierName: string;
  status: string | null;
  paymentStatus: string | null;
  startDate: Date | null;
  endDate: Date | null;
  priceSar: number | null;
}

export interface SubscriptionProgress {
  daysLeft: number;
  /** Share of the term already consumed, 0-100. */
  pct: number;
}

export interface SubscriptionBadge {
  label: string;
  classes: string;
}

export function statusLabel(status: string | null): SubscriptionBadge {
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

export function paymentLabel(payment: string | null): SubscriptionBadge {
  const s = ar.settings;
  const upper = String(payment || "").toUpperCase();
  if (upper === "PAID")
    return { label: s.paymentPaid, classes: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
  if (upper === "PENDING")
    return { label: s.paymentPending, classes: "bg-amber-100 text-amber-700 ring-amber-200" };
  return { label: s.paymentUnpaid, classes: "bg-red-100 text-red-700 ring-red-200" };
}

export function subscriptionProgress(
  start: Date | null,
  end: Date | null
): SubscriptionProgress | null {
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

export function formatSubscriptionDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}
