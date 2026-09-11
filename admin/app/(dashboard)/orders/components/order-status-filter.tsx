import type { CheckoutOrderStatus } from "@prisma/client";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { orderStatusCopy } from "../helpers/order-status-copy";

const STATUSES: CheckoutOrderStatus[] = ["AWAITING_PAYMENT", "AWAITING_TRANSFER", "PAID", "FAILED", "CANCELLED", "REFUNDED"];

/**
 * Status is state in the URL (`?status=`), not client state — a filtered view can be
 * bookmarked or sent to a teammate. Same two-part pill shape as daily-tasks/PersonFilter:
 * label | count, active one inverted, links so no client JS is needed to filter.
 */
export function OrderStatusFilter({ counts, total, active }: { counts: Partial<Record<CheckoutOrderStatus, number>>; total: number; active?: CheckoutOrderStatus }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="فلتر حالة الطلب">
      <Pill href="/orders" label="الكل" count={total} isActive={!active} />
      {STATUSES.map((status) => (
        <Pill key={status} href={`/orders?status=${status}`} label={orderStatusCopy(status).label} count={counts[status] ?? 0} isActive={active === status} />
      ))}
    </div>
  );
}

function Pill({ href, label, count, isActive }: { href: string; label: string; count: number; isActive: boolean }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={isActive}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive ? "border-primary" : "border-border hover:bg-accent",
      )}
    >
      <span className={cn("px-2.5 py-1.5", isActive ? "bg-primary text-primary-foreground" : "text-foreground")}>{label}</span>
      <span
        className={cn(
          "border-s px-2 py-1.5 font-bold tabular-nums",
          isActive ? "border-primary-foreground/30 bg-primary-foreground text-primary" : "border-border bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}
