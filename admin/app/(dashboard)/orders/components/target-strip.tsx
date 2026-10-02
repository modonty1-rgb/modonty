import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatOrderMoney } from "@/lib/orders/format-order-money";
import type { TargetProgress } from "@/lib/commissions/get-target-progress";

const sar = (m: number) => formatOrderMoney(m, "SAR");
const pct = (r: number) => `${Math.round(r * 100).toLocaleString("ar-EG")}٪`;

/**
 * «وين وصلنا من التارجت هالشهر» — above the subscriptions table (Khalid, 2 Oct 2026: «أنا كأدمن
 * أشوف البروجرس… وكل مندوب يشوف التارجت اللي هو وصل له»). The admin gets a line per rep; a rep
 * gets his own line only. The numbers come from `get-target-progress.ts`, the same source as the
 * commission statement, and the conversion detail lives there behind «التفاصيل».
 */
export function TargetStrip({ progress, isAdmin, monthLabel }: { progress: TargetProgress[]; isAdmin: boolean; monthLabel: string }) {
  if (!progress.length) return null;
  const ratioOf = (p: TargetProgress) => (p.targetSarMinor ? p.achievedSarMinor / p.targetSarMinor : -1);
  const rows = [...progress].sort((a, b) => ratioOf(b) - ratioOf(a) || a.repName.localeCompare(b.repName, "ar"));

  return (
    <section className="rounded-lg border bg-card px-4 py-3" aria-label="التارجت">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Target className="size-4 text-primary" aria-hidden />
        {isAdmin ? `تارجت المناديب — ${monthLabel}` : `تارجتك لشهر ${monthLabel}`}
      </p>
      <ul className="space-y-2">
        {rows.map((p) => {
          const ratio = p.targetSarMinor ? p.achievedSarMinor / p.targetSarMinor : 0;
          const done = ratio >= 1;
          const details = `/commission-statement?${new URLSearchParams({ tab: "target", ...(isAdmin ? { rep: p.repId } : {}) })}`;
          return (
            <li key={p.repId} className="grid grid-cols-[8rem_1fr_3.5rem_auto] items-center gap-3 text-sm max-sm:grid-cols-[1fr_3.5rem]">
              <span className="truncate font-medium max-sm:col-span-2">{isAdmin ? p.repName : "أنت"}</span>
              {p.targetSarMinor ? (
                <>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`تارجت ${p.repName}`} aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <div className={cn("h-full", done ? "bg-emerald-600" : "bg-primary")} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                  </div>
                  <b className={cn("tabular-nums", done && "text-emerald-700 dark:text-emerald-400")}>{pct(ratio)}</b>
                  <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground max-sm:col-span-2">
                    <span className="tabular-nums">
                      <b className="text-foreground">{sar(p.achievedSarMinor)}</b> من {sar(p.targetSarMinor)}
                    </span>
                    <span className={cn("tabular-nums", done && "font-semibold text-emerald-700 dark:text-emerald-400")}>
                      {done ? `تعدّى بـ ${sar(p.achievedSarMinor - p.targetSarMinor)}` : `باقي ${sar(p.targetSarMinor - p.achievedSarMinor)}`}
                    </span>
                    {p.missingRate ? <span className="text-amber-700 dark:text-amber-400">ناقص سعر الصرف</span> : null}
                    <Link href={details} className="inline-flex items-center gap-0.5 text-primary hover:underline">
                      التفاصيل <ArrowLeft className="size-3" aria-hidden />
                    </Link>
                  </span>
                </>
              ) : (
                <span className="col-span-3 text-xs text-muted-foreground max-sm:col-span-2">
                  ما تحدّد تارجت
                  {isAdmin ? (
                    <Link href={`/users/${p.repId}`} className="ms-2 font-semibold text-primary hover:underline">
                      حدّده
                    </Link>
                  ) : null}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
