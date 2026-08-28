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
  runStepWordCount,
  runStepClientSiteFlag,
  runStepEntityNameDrift,
  runStepMediaReelsBackfill,
  runStepBlurBackfill,
  runStepDimensionsBackfill,
  runStepOrphanRows,
  runStepSoftDeletedComments,
  runStepIntakeSeed,
  runStepAiPrompts,
  revalidateDatabasePage,
  logMaintenanceRunAction,
  flushModontyAfterMaintenance,
  type MaintenanceStepResult,
  type MaintenanceFlushReport,
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
  { key: "wordCount", label: "Article Word Count / Reading Time", description: "Articles whose stored word count disagrees with their own body. The mutations used to accept a caller-supplied number (`data.wordCount || calculate(...)`), so a wrong value stuck for good — measured 2026-08-19: 23 of 160, one storing 14 words for a 1,978-word article. The number is printed under the title, sent to Google in the article's structured data, graded by the SEO analyser, and it is what the reading-time filter on /articles buckets by, so a ten-minute article was filed under 'على الماشي ≤3 دقائق'. Recomputes word count, reading time and content depth with the same helper the mutations use. Idempotent.", runner: runStepWordCount },
  { key: "entityNameDrift", label: "Old Tag/Category Name in Article SEO", description: "Merging a tag or a category rebuilds its articles in a loop that runs in the BROWSER, so the editor can watch a progress bar. Close the tab mid-merge and the database move is done, some articles were rebuilt, and the finalize never ran — the rest keep publishing the pre-merge name to Google. Nothing else catches it: a merge never touches the Article row, so every timestamp check reports the article as healthy, and the existing JSON-LD repair only looks for a wrong host. This compares each stored blob against the entity's CURRENT name and rebuilds the ones that disagree. Idempotent — measured on modonty_dev: 264 tag links and 128 category articles checked, 0 flagged; a simulated rename on a real row flipped it to flagged, so it is not merely silent.", runner: runStepEntityNameDrift },
  { key: "clientSiteFlag", label: "Client-Site Flag", description: "Articles written before `isClientSiteArticle` existed carry no such key. An absent key matches NO filter in MongoDB, so the moment the articles list filters on it every one of them disappears from the table. Writes `false` where the key is missing. Idempotent.", runner: runStepClientSiteFlag },
  { key: "mediaReelsBackfill", label: "Media Reels Fields", description: "Media rows written before the reels merge carry no `inGallery` key and no counters. An absent key matches NO filter in MongoDB — every client gallery renders empty, and every counter increment is silently lost, until this runs. Idempotent.", runner: runStepMediaReelsBackfill },
  { key: "blurBackfill", label: "Image Blur Placeholders", description: "Images already on Bunny that carry no `blurDataURL`. The migration builds one from the buffer it downloads, but the generator returns null instead of throwing — a corrupt or exotic file migrates without a placeholder, and the migration never revisits a row that already has `bunnyUrl`. So the gap is permanent and silent until this runs. Batches of 50, one download each, idempotent.", runner: runStepBlurBackfill },
  { key: "dimensionsBackfill", label: "Image Dimensions", description: "Images on Bunny whose `width`/`height` are missing — the two numbers that reserve the box before the file lands. Without them the text renders first and gets shoved down on arrival: a layout shift the visitor feels as the page jumping, and one Google measures (CLS). Includes the three platform defaults, shown to every client who has not uploaded their own. Note the Mongo trap this is built around: the fields are ABSENT, not null, so a plain `width: null` filter matches nothing — the selector pairs every check with `isSet: false`. Batches of 50, one download each, idempotent.", runner: runStepDimensionsBackfill },
  { key: "orphanRows", label: "Orphan Rows (broken required relations)", description: "A row whose REQUIRED relation points at something deleted. Prisma refuses the whole query — not the bad row — so one dangling ArticleTag took the entire articles page away from a single client while everyone else was fine. Scans every required relation in the schema (read from Prisma's datamodel, so new ones are covered automatically). REPORT ONLY — deleting is a separate, reviewed action. Run this after every prod↔local sync: an import re-creates orphans silently.", runner: runStepOrphanRows },
  // ⛔ "Cloudinary Orphans" removed 2026-06-01 — blind mass-delete destroyed PROD assets when
  // run against dev. Disabled at source (sweepCloudinaryOrphans) + dropped from Run-All.
  // Redesign as review-before-delete (MASTER-TODO).
  { key: "softDeletedComments", label: "Soft-Deleted Comments (30d+)", description: "Permanently delete comments marked DELETED older than 30 days", runner: runStepSoftDeletedComments },
  { key: "intakeSeed", label: "Intake Questionnaire", description: "Bootstrap the client intake questions into the DB (create-only — never overwrites edits)", runner: runStepIntakeSeed },
  { key: "aiPrompts", label: "AI Prompts", description: "Bootstrap the 7 AI prompts into the DB from their code defaults (create-only — never overwrites an edited prompt)", runner: runStepAiPrompts },
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
  const [flush, setFlush] = useState<MaintenanceFlushReport | null>(null);

  const hasWork = attentionCount > 0;

  const runAll = async () => {
    setRunning(true);
    setStarted(true);
    setFinished(false);
    setElapsedMs(null);
    setFlush(null);
    // Mark all as pending
    setSteps(Object.fromEntries(STEPS.map((s) => [s.key, { status: "pending" as Status }])));
    const startedAt = Date.now();

    // Collected locally, not read back from state: setSteps is async and the log must
    // describe the run that actually happened.
    const results: MaintenanceStepResult[] = [];

    for (const step of STEPS) {
      setSteps((prev) => ({ ...prev, [step.key]: { status: "running" } }));
      const result = await step.runner();
      results.push(result);
      setSteps((prev) => ({
        ...prev,
        [step.key]: { status: result.ok ? "done" : "failed", result },
      }));
    }

    setElapsedMs(Date.now() - startedAt);
    setFinished(true);
    setRunning(false);

    // One audit line for the whole pass — who ran it and what it changed.
    await logMaintenanceRunAction(
      results.map((r) => ({ key: r.key, ok: r.ok, count: r.count })),
    ).catch(() => {});

    // A fix nobody can see is not a fix: modonty serves cached pages, so the pass has to bust
    // the tags it dirtied. Reported below rather than swallowed — the operator needs to know
    // which fixes went out and which are still sitting behind a stale cache.
    setFlush(
      await flushModontyAfterMaintenance(results).catch(() => ({
        flushed: [],
        held: [
          {
            key: "flush",
            detail: "تعذّر الاتصال بمدونتي — الإصلاحات محفوظة لكن ما وصلت الصفحة العامة",
            blockedTags: [],
          },
        ],
      })),
    );

    await revalidateDatabasePage();
    router.refresh();
  };

  const reset = () => {
    setSteps(idleState);
    setStarted(false);
    setFinished(false);
    setElapsedMs(null);
    setFlush(null);
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

          {/* Did the work reach a reader? The counts above only prove the DB changed. */}
          {flush && (
            <div className="rounded-md border bg-background/60 px-3 py-2 space-y-1 text-xs">
              <p className={flush.flushed.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                <span className="font-semibold">Public cache: </span>
                {flush.flushed.length > 0
                  ? `refreshed ${flush.flushed.join(" · ")} on modonty`
                  : "nothing to refresh — no public data changed"}
              </p>
              {flush.held.length > 0 && (
                <p className="text-amber-600 dark:text-amber-400">
                  <span className="font-semibold">Held back: </span>
                  {flush.held
                    .map((h) => {
                      const why = [h.detail, h.blockedTags.length > 0 ? `blocks ${h.blockedTags.join(",")}` : undefined]
                        .filter(Boolean)
                        .join(" · ");
                      return why ? `${h.key} (${why})` : h.key;
                    })
                    .join(" · ")}
                  {" — "}fix the errors above and run again; the public page is still on the old data.
                </p>
              )}
            </div>
          )}

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
