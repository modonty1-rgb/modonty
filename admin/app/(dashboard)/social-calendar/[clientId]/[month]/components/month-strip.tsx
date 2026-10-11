import Link from "next/link";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { MONTH_LABELS, formatMonthParam } from "../../../helpers/dates";

/**
 * شريط الشهور الأفقي فوق الجدول — ١٢ شهراً من سنة الشهر المفتوح بعدّاداتها · «منشور جديد».
 * بلا مبدّل سنة ولا شهور فارغة: لا أحد يغيّر السنة، والشهر يظهر بأوّل منشور (خالد ١٠ أكتوبر ٢٠٢٦).
 * حلّ محلّ عمود الشهور الجانبي: الشاشة كان فيها سايدبار الأدمن وسايدبار ثانٍ للشهور (خالد، ١٠ أكتوبر ٢٠٢٦).
 * «منشور جديد» يظهر لمن يملك كتابة البريف فقط.
 */
export function MonthStrip({
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
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-2">
      <nav aria-label="شهور السنة" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {MONTH_LABELS.map((label, i) => {
          const count = counts[i] ?? 0;
          const isActive = i === activeMonth;
          // شهر بلا منشورات لا يظهر — يظهر حين يُضاف له أوّل منشور (خالد ١٠ أكتوبر ٢٠٢٦).
          // الشهر المفتوح يبقى ولو فارغاً، كي لا تختفي الصفحة التي أنت فيها من شريطها.
          if (count === 0 && !isActive) return null;
          return (
            <Link
              key={label}
              href={`/social-calendar/${clientId}/${formatMonthParam(year, i)}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] transition-colors",
                isActive
                  ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1 text-[10px] font-bold leading-4 tabular-nums",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {canCreate && (
        <>
          <span className="h-6 w-px shrink-0 bg-border" />
          <Link
            href={`/social-calendar/${clientId}/${formatMonthParam(year, activeMonth)}/new`}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            منشور جديد
          </Link>
        </>
      )}
    </div>
  );
}
