"use client";

import { useEffect, useRef, useState } from "react";

import { Loader2, CheckCircle2, XCircle } from "lucide-react";

/**
 * SHARED long-task progress bar. Use anywhere a job runs longer than a couple of seconds —
 * a bare spinner leaves the operator unable to tell "working" from "stuck" (Khalid, 2026-07-30).
 *
 * Two modes:
 *
 *   determinate  — you know the totals. Pass `current` + `total`; it shows a real percentage.
 *   indeterminate— you don't (a single server action that only returns at the end). Pass
 *                  `etaSeconds` and it animates an honest, *capped* estimate: it creeps toward
 *                  95% and waits there. It never claims 100% before the job actually reports
 *                  done, so the bar can't lie.
 *
 * The elapsed clock always ticks from real time, so even in indeterminate mode the operator
 * has a truthful signal that work is still happening.
 */
export interface TaskProgressProps {
  /** true while the job runs. Flipping to false with no error renders the success state. */
  active: boolean;
  /** Items completed — omit for indeterminate mode. */
  current?: number;
  /** Total items — omit for indeterminate mode. */
  total?: number;
  /** What is happening right now, e.g. "Pass 2/3 — swapping raw fields". */
  label?: string;
  /** Rough duration in seconds; drives the indeterminate creep. Default 60. */
  etaSeconds?: number;
  /** Set to render the failed state. */
  error?: string | null;
  /** Shown when finished without error. */
  doneLabel?: string;
}

function clock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TaskProgress({
  active,
  current,
  total,
  label,
  etaSeconds = 60,
  error,
  doneLabel = "Done",
}: TaskProgressProps) {
  const determinate = typeof current === "number" && typeof total === "number" && total > 0;

  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      startedAt.current = null;
      setElapsed(0);
      return;
    }
    // Date.now() is fine here: this is a live UI clock, not persisted state.
    startedAt.current = Date.now();
    const id = setInterval(() => {
      if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  // Indeterminate: approach 95% asymptotically — honest, never claims completion early.
  const creep = Math.min(95, Math.round((1 - Math.exp(-elapsed / (etaSeconds * 0.6))) * 95));
  const pct = error ? 100 : !active ? 100 : determinate ? Math.round((current! / total!) * 100) : creep;

  const tone = error
    ? "bg-destructive"
    : !active
      ? "bg-emerald-500"
      : "bg-primary";

  return (
    <div className="space-y-1.5" role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-1.5 min-w-0">
          {error ? (
            <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
          ) : active ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          )}
          <span className="truncate">{error ?? (active ? (label ?? "Working…") : doneLabel)}</span>
        </span>
        <span className="tabular-nums text-muted-foreground shrink-0" dir="ltr">
          {determinate && active ? `${current}/${total} · ` : ""}
          {pct}%
          {active ? ` · ${clock(elapsed)}` : ""}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {active && !determinate && (
        <p className="text-[10px] text-muted-foreground">
          Progress is estimated — the bar stops at 95% and completes only when the task reports back.
        </p>
      )}
    </div>
  );
}
