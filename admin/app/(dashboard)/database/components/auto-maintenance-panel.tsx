"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Wand2, CheckCircle2, XCircle, Circle, RotateCcw } from "lucide-react";
import {
  runStepOtps,
  runStepSessions,
  runStepVersions,
  runStepTtl,
  runStepPerfIndexes,
  runStepLegalForm,
  runStepOrganizationType,
  runStepCanonical,
  runStepHreflang,
  runStepSoftDeletedComments,
  runStepIntakeSeed,
  revalidateDatabasePage,
  type MaintenanceStepResult,
} from "../actions/run-all-maintenance";

type Status = "idle" | "pending" | "running" | "done" | "failed";

interface StepDef {
  key: string;
  label: string;
  description: string;
  runner: () => Promise<MaintenanceStepResult>;
}

const STEPS: StepDef[] = [
  { key: "otps", label: "Expired OTPs", description: "Slug-change codes past expiry", runner: runStepOtps },
  { key: "sessions", label: "Expired Sessions", description: "NextAuth sessions + verification tokens", runner: runStepSessions },
  { key: "versions", label: "Stale Versions (30d+)", description: "Article version snapshots older than 30 days", runner: runStepVersions },
  { key: "ttl", label: "TTL Indexes", description: "Missing TTL indexes for auto-expiry", runner: runStepTtl },
  { key: "perfIndexes", label: "Query Indexes", description: "Missing query indexes (e.g. page-view tracking) — additive, never drops", runner: runStepPerfIndexes },
  { key: "legalform", label: "Legal Forms", description: "Clients with non-canonical legalForm values", runner: runStepLegalForm },
  { key: "organizationType", label: "Organization Types", description: "Clients with non-canonical organizationType values", runner: runStepOrganizationType },
  { key: "canonical", label: "Canonical URLs", description: "Wrong-host or double-encoded canonical URLs across articles, clients, categories, tags, industries, authors", runner: runStepCanonical },
  { key: "hreflang", label: "Article hreflang", description: "Articles whose stored metadata carries no hreflang — the live page adds it, the SEO score does not see it, so every one of them is under-scored by 10 points until this runs", runner: runStepHreflang },
  // ⛔ "Cloudinary Orphans" removed 2026-06-01 — blind mass-delete destroyed PROD assets when
  // run against dev. Disabled at source (sweepCloudinaryOrphans) + dropped from Run-All.
  // Redesign as review-before-delete (MASTER-TODO).
  { key: "softDeletedComments", label: "Soft-Deleted Comments (30d+)", description: "Permanently delete comments marked DELETED older than 30 days", runner: runStepSoftDeletedComments },
  { key: "intakeSeed", label: "Intake Questionnaire", description: "Bootstrap the client intake questions into the DB (create-only — never overwrites edits)", runner: runStepIntakeSeed },
];

interface StepState {
  status: Status;
  result?: MaintenanceStepResult;
}

const idleState: Record<string, StepState> = Object.fromEntries(
  STEPS.map((s) => [s.key, { status: "idle" as Status }]),
);

export function AutoMaintenancePanel({ attentionCount }: { attentionCount: number }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [steps, setSteps] = useState<Record<string, StepState>>(idleState);
  const [finished, setFinished] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const hasWork = attentionCount > 0;

  const runAll = async () => {
    setRunning(true);
    setStarted(true);
    setFinished(false);
    setElapsedMs(null);
    // Mark all as pending
    setSteps(Object.fromEntries(STEPS.map((s) => [s.key, { status: "pending" as Status }])));
    const startedAt = Date.now();

    for (const step of STEPS) {
      setSteps((prev) => ({ ...prev, [step.key]: { status: "running" } }));
      const result = await step.runner();
      setSteps((prev) => ({
        ...prev,
        [step.key]: { status: result.ok ? "done" : "failed", result },
      }));
    }

    setElapsedMs(Date.now() - startedAt);
    setFinished(true);
    setRunning(false);
    await revalidateDatabasePage();
    router.refresh();
  };

  const reset = () => {
    setSteps(idleState);
    setStarted(false);
    setFinished(false);
    setElapsedMs(null);
  };

  const completedCount = STEPS.filter((s) => steps[s.key].status === "done" || steps[s.key].status === "failed").length;
  const overallPercent = Math.round((completedCount / STEPS.length) * 100);
  const totalFixed = Object.values(steps).reduce((sum, s) => sum + (s.result?.count ?? 0), 0);
  const failedCount = Object.values(steps).filter((s) => s.status === "failed").length;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between gap-3 flex-wrap border-b">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">Auto-Maintenance</p>
          <p className="text-xs text-muted-foreground">
            Runs {STEPS.length} safe, deterministic clean-ups in one click. SEO maintenance is at /seo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {started && !running && (
            <Button size="sm" variant="ghost" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
          <Button
            size="sm"
            onClick={runAll}
            disabled={running}
            className="gap-2"
            variant={hasWork || started ? "default" : "outline"}
          >
            {running ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Running…</>
            ) : finished ? (
              <><Wand2 className="h-4 w-4" /> Run Again</>
            ) : (
              <><Wand2 className="h-4 w-4" /> Run All Auto-Maintenance</>
            )}
            {hasWork && !started && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none bg-primary-foreground/20 text-primary-foreground">
                {attentionCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Status strip — visible when running or finished */}
      {started && (
        <div className="p-4 space-y-3 bg-muted/20">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {running ? (
                  <span className="flex items-center gap-1.5 text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" /> In progress
                  </span>
                ) : failedCount === 0 ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Complete — {totalFixed} fixed
                    {elapsedMs !== null ? ` in ${(elapsedMs / 1000).toFixed(1)}s` : ""}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-destructive">
                    <XCircle className="h-3 w-3" /> Finished with {failedCount} error{failedCount === 1 ? "" : "s"}
                  </span>
                )}
              </span>
              <span className="font-semibold tabular-nums text-muted-foreground">
                {completedCount} / {STEPS.length}
              </span>
            </div>
            <Progress value={overallPercent} className="h-2" />
          </div>

          {/* Per-step rows */}
          <ul className="space-y-2.5 pt-1">
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
                    value={
                      state.status === "done" || state.status === "failed"
                        ? 100
                        : state.status === "running"
                          ? undefined
                          : 0
                    }
                    indeterminate={state.status === "running"}
                    className="h-1"
                    tone={state.status === "failed" ? "destructive" : "default"}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
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
  if (state.status === "running") return <span className="text-primary">running…</span>;
  if (state.status === "failed")
    return <span className="text-destructive">{state.result?.detail ?? "failed"}</span>;
  // done
  const count = state.result?.count ?? 0;
  const detail = state.result?.detail;
  return (
    <span className={count > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
      {count > 0 ? `${count} fixed` : "clean"}
      {detail ? ` · ${detail}` : ""}
    </span>
  );
}
