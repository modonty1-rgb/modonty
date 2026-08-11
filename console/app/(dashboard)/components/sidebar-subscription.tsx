import { Crown, Globe, Check } from "lucide-react";
import { ar } from "@/lib/ar";
import { cn } from "@/lib/utils";

import type { SubscriptionBadge, SubscriptionProgress } from "@/lib/subscription";

export interface SidebarSubscriptionProps {
  tierName: string;
  status: SubscriptionBadge;
  payment: SubscriptionBadge;
  progress: SubscriptionProgress | null;
  endDate: string;
  /** Publishing to the client's own website is switched on. */
  siteArticlesEnabled: boolean;
  isCollapsed?: boolean;
}

/**
 * The plan, sitting in the fixed foot of the rail rather than inside the scrolling nav
 * (Khalid 2026-08-11): the client should never have to open Settings — or scroll — to see
 * what they are on and how long is left. Days and percentage arrive already computed from
 * the server so the number here can never drift from the settings card.
 */
export function SidebarSubscription({
  tierName,
  status,
  payment,
  progress,
  endDate,
  siteArticlesEnabled,
  isCollapsed = false,
}: SidebarSubscriptionProps) {
  const s = ar.settings;

  if (isCollapsed) {
    return (
      <div
        className="flex flex-col items-center gap-1 border-t border-border px-2 py-2"
        title={`${tierName} — ${progress ? `${progress.daysLeft} ${s.daysLeft}` : status.label}`}
      >
        <Crown className="h-4 w-4 text-primary" />
        {progress && (
          <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
            {progress.daysLeft}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 border-t border-border px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate text-sm font-semibold text-foreground">{tierName}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {/* A globe with a check, beside the plan status: the client's one-glance proof
              that publishing to their own website is live (Khalid 2026-08-11). */}
          {siteArticlesEnabled && (
            <span
              title={ar.nav.siteArticlesEnabledHint}
              aria-label={ar.nav.siteArticlesEnabledHint}
              className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-400"
            >
              <Globe className="h-3 w-3" aria-hidden="true" />
              <Check className="h-2.5 w-2.5" aria-hidden="true" />
            </span>
          )}
          <span
            className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium ring-1", status.classes)}
          >
            {status.label}
          </span>
        </span>
      </div>

      {progress && (
        <div className="space-y-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${progress.pct}%` }} />
          </div>
          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span className="tabular-nums">
              {progress.daysLeft} {s.daysLeft}
            </span>
            {/* Latin digits inside an Arabic line: isolate it so the date cannot reorder. */}
            <bdi className="tabular-nums">{endDate}</bdi>
          </div>
        </div>
      )}

      {/* Payment only speaks up when it is not settled — a permanent green «مدفوع» is
          noise, while «غير مدفوع» is the one thing the client must not miss. */}
      {payment.label !== s.paymentPaid && (
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
            payment.classes
          )}
        >
          {payment.label}
        </span>
      )}
    </div>
  );
}
