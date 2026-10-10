import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { MONTH_LABELS, formatMonthParam } from "../../../helpers/dates";

/**
 * شريط الشهور — ١٢ شهراً بعدّاداتها وزرّ «منشور جديد» (القديم `MonthSidebar.tsx`).
 * الفرق: سنة معروضة بسهمَي سابقة/تالية بدل «السنة الحالية» المكتوبة في الأسفل فقط، لأن
 * المنشور الآن له سنة. «منشور جديد» يظهر لمن يملك كتابة البريف فقط.
 */
export function MonthSidebar({
  clientId,
  year,
  activeMonth,
  counts,
  canCreate,
}: {
  clientId: string;
  year: number;
  activeMonth: number;
  counts: number[];
  canCreate: boolean;
}) {
  const activeParam = formatMonthParam(year, activeMonth);
  const total = counts.reduce((s, v) => s + v, 0);

  return (
    <aside className="flex w-40 shrink-0 flex-col border-r border-border bg-card">
      {canCreate && (
        <div className="shrink-0 px-2 pb-1 pt-2">
          <Link
            href={`/social-calendar/${clientId}/${activeParam}/new`}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            منشور جديد
          </Link>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between px-2 pt-2">
        <Link
          href={`/social-calendar/${clientId}/${formatMonthParam(year - 1, activeMonth)}`}
          aria-label="السنة السابقة"
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <span className="text-xs font-bold tabular-nums text-foreground">{year}</span>
        <Link
          href={`/social-calendar/${clientId}/${formatMonthParam(year + 1, activeMonth)}`}
          aria-label="السنة التالية"
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2">
        {MONTH_LABELS.map((label, i) => {
          const count = counts[i] ?? 0;
          const isActive = i === activeMonth;
          return (
            <Link
              key={label}
              href={`/social-calendar/${clientId}/${formatMonthParam(year, i)}`}
              className={cn(
                "group flex select-none items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-all duration-100",
                isActive
                  ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                  : count > 0
                    ? "text-foreground/80 hover:bg-muted hover:text-foreground"
                    : "text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground",
              )}
            >
              <span className="truncate">{label}</span>
              {count > 0 ? (
                <span
                  className={cn(
                    "min-w-5 shrink-0 rounded-full px-1.5 text-center text-[10px] font-bold leading-5 tabular-nums",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                  )}
                >
                  {count}
                </span>
              ) : (
                <span className="h-1 w-1 shrink-0 rounded-full bg-border opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">{year}</p>
        <span className="text-[10px] font-semibold tabular-nums text-muted-foreground/60">{total} منشور</span>
      </div>
    </aside>
  );
}
