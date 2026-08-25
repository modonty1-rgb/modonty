"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2, XCircle, Circle, FileText } from "lucide-react";
import {
  runSeoStepJsonLd,
  runSeoStepCanonical,
  runSeoStepSitemap,
  runSeoStepHreflang,
  runSeoStepAuthor,
  revalidateSeoPage,
  type SeoMaintenanceStepResult,
} from "../actions/run-seo-maintenance";

type Status = "idle" | "pending" | "running" | "done" | "failed";

interface StepDef {
  key: string;
  label: string;
  runner: () => Promise<SeoMaintenanceStepResult>;
}

const STEPS: StepDef[] = [
  { key: "jsonld", label: "JSON-LD hosts", runner: runSeoStepJsonLd },
  { key: "canonical", label: "Canonical URLs (7 tables)", runner: runSeoStepCanonical },
  { key: "sitemap", label: "Sitemaps → Search Console", runner: runSeoStepSitemap },
  { key: "hreflang", label: "hreflang locales", runner: runSeoStepHreflang },
  { key: "author", label: "Author identity", runner: runSeoStepAuthor },
];

interface StepState {
  status: Status;
  result?: SeoMaintenanceStepResult;
}

const idleState: Record<string, StepState> = Object.fromEntries(
  STEPS.map((s) => [s.key, { status: "idle" as Status }]),
);

/** Long enough for the slowest step (canonical sweeps 7 tables), short enough to notice. */
const STEP_TIMEOUT_MS = 45_000;

/**
 * One step, and it always settles.
 *
 * The runners already return `{ ok: false }` on a thrown error, so what got through was the
 * third case: a promise that neither resolves nor rejects. One of those froze the strip at
 * "checking… 4/5" indefinitely (observed 25 Aug 2026). A hung step is now reported as a
 * failed step — "refresh to retry" is already on screen for that — instead of hiding as a
 * spinner that never stops.
 */
async function runStep(step: StepDef): Promise<SeoMaintenanceStepResult> {
  const timedOut: SeoMaintenanceStepResult = {
    key: step.key,
    label: step.label,
    ok: false,
    count: 0,
    detail: `no response after ${STEP_TIMEOUT_MS / 1000}s`,
  };
  try {
    return await Promise.race([
      step.runner(),
      new Promise<SeoMaintenanceStepResult>((resolve) =>
        setTimeout(() => resolve(timedOut), STEP_TIMEOUT_MS),
      ),
    ]);
  } catch (e) {
    return {
      key: step.key,
      label: step.label,
      ok: false,
      count: 0,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Standard fixes — no button, by design.
 *
 * Every step self-skips when there is nothing to do (no stale host found, canonical already
 * correct, sitemap submitted less than 24h ago, hreflang complete, author already an
 * Organization), so running them costs nothing when the site is healthy. Making them a
 * button meant they only ran when somebody remembered to press it; this page is opened
 * maybe once a fortnight, so the fixes now run on open and this card is the report.
 *
 * No session guard either: with no manual trigger, a refresh has to be the retry when a
 * step fails on a network blip.
 *
 * Deliberately NOT covered here: settings changes. These five repair drift in stored
 * values; regenerating SEO against new settings is Full Rebuild's job.
 */
export function SeoAutoMaintenance({
  attentionCount,
  onRunningChange,
}: {
  attentionCount: number;
  /** Lets the parent hold Full Rebuild back until the canonical repair has landed. */
  onRunningChange?: (running: boolean) => void;
}) {
  const router = useRouter();
  const [steps, setSteps] = useState<Record<string, StepState>>(idleState);
  const [running, setRunning] = useState(true);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const startedRef = useRef(false);
  useEffect(() => {
    // Mount-only. A link prefetch renders the server component but never mounts this
    // effect, so hovering the sidebar entry does not trigger a run.
    if (startedRef.current) return;
    startedRef.current = true;

    void (async () => {
      setSteps(Object.fromEntries(STEPS.map((s) => [s.key, { status: "pending" as Status }])));
      const startedAt = Date.now();

      try {
        for (const step of STEPS) {
          setSteps((prev) => ({ ...prev, [step.key]: { status: "running" } }));
          const result = await runStep(step);
          setSteps((prev) => ({
            ...prev,
            [step.key]: { status: result.ok ? "done" : "failed", result },
          }));
        }
      } finally {
        // `finally`, not a trailing statement: this strip gates Full Rebuild through
        // `onRunningChange`, so a step that never settles used to disable the site's only
        // regenerate button permanently — the page had to be reloaded to get it back, and a
        // reload restarted the same hang. Whatever happens above, the gate reopens.
        setElapsedMs(Date.now() - startedAt);
        setRunning(false);
      }

      await revalidateSeoPage();
      router.refresh();
    })();
  }, [router]);

  useEffect(() => {
    onRunningChange?.(running);
  }, [running, onRunningChange]);

  const completedCount = STEPS.filter(
    (s) => steps[s.key].status === "done" || steps[s.key].status === "failed",
  ).length;
  const totalFixed = Object.values(steps).reduce((sum, s) => sum + (s.result?.count ?? 0), 0);
  const failedCount = Object.values(steps).filter((s) => s.status === "failed").length;

  // While it works the strip has to be visible — after that it collapses to one line, because
  // the outcome only matters for the few seconds you read it.
  const tone = failedCount > 0 ? "error" : totalFixed > 0 ? "fixed" : "clean";

  return (
    <>
      <div className="rounded-lg border bg-card px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 text-xs">
          {running ? (
            <>
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
              <span className="font-medium text-primary">Standard fixes — checking…</span>
              <span className="text-muted-foreground tabular-nums">
                {completedCount}/{STEPS.length}
              </span>
            </>
          ) : tone === "error" ? (
            <>
              <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
              <span className="font-medium text-destructive">
                Standard fixes — {failedCount} error{failedCount === 1 ? "" : "s"}
              </span>
              <span className="text-muted-foreground">refresh to retry</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {tone === "clean" ? "Standard fixes — all clean" : `Standard fixes — ${totalFixed} fixed`}
              </span>
              {elapsedMs !== null && (
                <span className="text-muted-foreground tabular-nums">
                  {(elapsedMs / 1000).toFixed(1)}s
                </span>
              )}
            </>
          )}
        </div>

        {!running && (
          <Button size="sm" variant="ghost" onClick={() => setReportOpen(true)} className="h-7 gap-1.5 text-xs shrink-0">
            <FileText className="h-3.5 w-3.5" /> Report
          </Button>
        )}
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              🔗 Standard Fixes
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ran automatically when this page opened. Repairs wrong hosts in cached JSON-LD,
              corrects canonical URLs across 7 tables, resubmits sitemaps older than 24h to
              Search Console, completes the hreflang locale list, and keeps the Modonty author
              an Organization.
            </DialogDescription>
          </DialogHeader>

          <p className="text-[11px] text-amber-600 dark:text-amber-400 -mt-1">
            Does <span className="font-semibold">not</span> pick up settings changes — run Full
            Rebuild for that.
          </p>

          <ul className="space-y-2.5">
            {STEPS.map((step) => {
              const state = steps[step.key];
              return (
                <li key={step.key} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusIcon status={state.status} />
                      <span className="font-medium truncate">{step.label}</span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums shrink-0 text-end">
                      <StatusLabel state={state} />
                    </span>
                  </div>
                  <Progress
                    value={state.status === "done" || state.status === "failed" ? 100 : 0}
                    className="h-1"
                    tone={state.status === "failed" ? "destructive" : "default"}
                  />
                </li>
              );
            })}
          </ul>

          <p className="text-[11px] text-muted-foreground border-t pt-3">
            {attentionCount > 0
              ? `${attentionCount} area${attentionCount === 1 ? " was" : "s were"} flagged when the page opened.`
              : "Nothing was flagged when the page opened."}{" "}
            Every canonical rewrite is recorded in the Audit Log with its previous value.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "running") return <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />;
  if (status === "done") return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (status === "failed") return <XCircle className="h-4 w-4 text-destructive shrink-0" />;
  return <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />;
}

function StatusLabel({ state }: { state: StepState }) {
  if (state.status === "idle" || state.status === "pending")
    return <span className="text-muted-foreground/60">waiting</span>;
  if (state.status === "running") return <span className="text-primary">checking…</span>;
  if (state.status === "failed")
    return <span className="text-destructive">{state.result?.detail ?? "failed"}</span>;
  const count = state.result?.count ?? 0;
  const detail = state.result?.detail;
  return (
    <span className={count > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
      {count > 0 ? `${count} fixed` : "clean"}
      {detail ? ` · ${detail}` : ""}
    </span>
  );
}
