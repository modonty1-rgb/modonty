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
export function OrderStatusFilter({
  counts,
  total,
  active,
  awaitingActivation,
  isAwaitingView,
}: {
  counts: Partial<Record<CheckoutOrderStatus, number>>;
  total: number;
  active?: CheckoutOrderStatus;
  /** مدفوعٌ بلا حساب عميل — ليست حالةً في القاعدة بل غيابُ `clientId`. */
  awaitingActivation: number;
  isAwaitingView: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="فلتر حالة الطلب">
      <Pill href="/orders" label="الكل" count={total} isActive={!active && !isAwaitingView} />
      {/* أوّل الصفّ عن قصد: هو الوحيد الذي يعني عملاً على الفريق الآن — مالٌ وصل وخدمةٌ لم تبدأ.
          وليس حالةَ طلبٍ في القاعدة، فلذلك رابطُه `?view=` لا `?status=`. */}
      <Pill
        href="/orders?view=awaiting-activation"
        label="ينتظر التفعيل"
        count={awaitingActivation}
        isActive={isAwaitingView}
        tone={awaitingActivation > 0 ? "alert" : undefined}
      />
      {STATUSES.map((status) => (
        <Pill key={status} href={`/orders?status=${status}`} label={orderStatusCopy(status).label} count={counts[status] ?? 0} isActive={active === status} />
      ))}
    </div>
  );
}

function Pill({ href, label, count, isActive, tone }: { href: string; label: string; count: number; isActive: boolean; tone?: "alert" }) {
  const alert = tone === "alert" && !isActive;
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={isActive}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive ? "border-primary" : alert ? "border-amber-500/50 hover:bg-amber-500/10" : "border-border hover:bg-accent",
      )}
    >
      <span className={cn("px-2.5 py-1.5", isActive ? "bg-primary text-primary-foreground" : alert ? "text-amber-700 dark:text-amber-500" : "text-foreground")}>{label}</span>
      <span
        className={cn(
          "border-s px-2 py-1.5 font-bold tabular-nums",
          isActive
            ? "border-primary-foreground/30 bg-primary-foreground text-primary"
            : alert
              ? "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-500"
              : "border-border bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}
