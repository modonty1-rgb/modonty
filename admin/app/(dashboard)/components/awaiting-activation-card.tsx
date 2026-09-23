import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";

import { getAwaitingActivationTotals } from "@/lib/orders/awaiting-activation";
import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";

/**
 * Paid orders with no client account yet — the card that makes a sleeping order visible.
 *
 * Activation is MANUAL by decision (Khalid, 17 Sep: «التفعيل حيكون مانيوال»), and a manual
 * step nobody is reminded of is a step that does not happen: measured on dev, 4 of 5 paid
 * orders had no client account and no invoice. So this card is not a nicety — it is the
 * guard that makes the manual decision survivable (ACTIVATION-FLOW §1).
 *
 * Renders NOTHING when the queue is empty: a dashboard that always shows a money box
 * teaches the eye to skip it.
 */
export async function AwaitingActivationCard() {
  const { count, byCurrency, oldestDays } = await getAwaitingActivationTotals();
  if (count === 0) return null;

  return (
    <Link
      href="/orders?view=awaiting-activation"
      className="group flex items-center gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] px-5 py-4 transition-colors hover:bg-amber-500/[0.12]"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-500">
        <Wallet className="size-5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
          {count === 1 ? "طلبٌ مدفوع ينتظر التفعيل" : `${count} طلبات مدفوعة تنتظر التفعيل`}
        </p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {/* كل عملةٍ وحدها — جمعُ الريال بالجنيه هو العطل الذي وُجد القرار ٤ ليمنعه. */}
          <span className="font-semibold tabular-nums text-foreground">
            {byCurrency.map((c) => money(c.totalMinor, c.currency)).join(" + ")}
          </span>
          {" "}وصلت، والخدمة ما بدأت
          {oldestDays !== null && oldestDays > 0 && (
            <> · أقدمها من <span className="tabular-nums">{oldestDays}</span> يوم</>
          )}
        </p>
      </div>

      <ArrowLeft className="size-4 shrink-0 text-amber-600/70 transition-transform group-hover:-translate-x-0.5 dark:text-amber-500/70" aria-hidden />
    </Link>
  );
}

function money(minor: number, currency: string) {
  const amount = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(minor / 100);
  return `${amount} ${currencyLabel(currency)}`;
}
