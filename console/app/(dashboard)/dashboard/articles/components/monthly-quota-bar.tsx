export interface MonthlyQuotaBarProps {
  published: number;
  /** Articles per month in the client's contract — 0 when none is set. */
  quota: number;
  /** Formatted on the server: the number must not depend on the visitor's clock. */
  resetDate: string;
}

/**
 * One strip above the tabs instead of a screen of its own (Khalid 2026-08-11). The
 * quota is the one thing «نشاط المحتوى» said that the tabs cannot — everything else on
 * that page was a second rendering of the same lists — so it moved here and the page went.
 */
export function MonthlyQuotaBar({ published, quota, resetDate }: MonthlyQuotaBarProps) {
  const remaining = Math.max(0, quota - published);
  const pct = quota > 0 ? Math.min(100, Math.round((published / quota) * 100)) : 0;

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
        <p className="text-muted-foreground">
          {quota > 0 ? (
            <>
              رصيدك هذا الشهر:{" "}
              <span className="font-bold tabular-nums text-foreground">{published}</span> من{" "}
              <span className="font-bold tabular-nums text-foreground">{quota}</span> — متبقّي{" "}
              <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {remaining}
              </span>
            </>
          ) : (
            <>
              نُشر <span className="font-bold tabular-nums text-foreground">{published}</span> مقال
              هذا الشهر
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          يُجدَّد في <span className="font-medium text-foreground">{resetDate}</span>
        </p>
      </div>

      {quota > 0 && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              pct >= 100 ? "bg-emerald-500" : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
