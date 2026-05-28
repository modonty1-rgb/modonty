"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Play, CheckCircle2, XCircle, AlertCircle, Clock, Hourglass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getCascadeEntities,
  regenerateOneArticleCascade,
  regenerateOneClientCascade,
  regenerateBulkCategoriesCascade,
  regenerateBulkTagsCascade,
  regenerateBulkIndustriesCascade,
  regenerateListingsCascade,
  finalizeCascadeRevalidation,
} from "../actions/cascade-step-actions";

type CascadeState = "idle" | "running" | "done" | "error";

interface PhaseProgress {
  done: number;
  total: number;
  ok: boolean;
}

interface CascadeProgress {
  categories: PhaseProgress;
  tags: PhaseProgress;
  industries: PhaseProgress;
  clients: PhaseProgress;
  articles: PhaseProgress;
  listings: PhaseProgress;
}

const INITIAL_PROGRESS: CascadeProgress = {
  categories: { done: 0, total: 0, ok: false },
  tags: { done: 0, total: 0, ok: false },
  industries: { done: 0, total: 0, ok: false },
  clients: { done: 0, total: 0, ok: false },
  articles: { done: 0, total: 0, ok: false },
  listings: { done: 0, total: 1, ok: false },
};

const CONCURRENCY = 5;

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  return remSec === 0 ? `${minutes}m` : `${minutes}m ${remSec}s`;
}

function totalsOf(p: CascadeProgress): { done: number; total: number } {
  const sum = (key: keyof CascadeProgress) => p[key];
  const phases = [sum("categories"), sum("tags"), sum("industries"), sum("clients"), sum("articles"), sum("listings")];
  return {
    done: phases.reduce((s, x) => s + x.done, 0),
    total: phases.reduce((s, x) => s + x.total, 0),
  };
}

export function CascadeStatusPanel() {
  const { toast } = useToast();
  const [state, setState] = useState<CascadeState>("idle");
  const [progress, setProgress] = useState<CascadeProgress>(INITIAL_PROGRESS);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const { done, total } = totalsOf(progress);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const elapsedMs = startedAt ? (completedAt ?? Date.now() + tick * 0) - startedAt : 0;
  // tick triggers re-render; recompute elapsed on every tick
  void tick;
  const liveElapsedMs = startedAt && state === "running" ? Date.now() - startedAt : elapsedMs;
  const etaMs = state === "running" && done > 0 && total > done && startedAt
    ? Math.round(((Date.now() - startedAt) / done) * (total - done))
    : null;

  async function runCascade() {
    setState("running");
    setProgress(INITIAL_PROGRESS);
    setStartedAt(Date.now());
    setCompletedAt(null);
    setErrorMsg(null);
    const t0 = Date.now();

    try {
      const cats = await regenerateBulkCategoriesCascade();
      setProgress((p) => ({ ...p, categories: { done: cats.successful, total: cats.total, ok: cats.success } }));

      const tags = await regenerateBulkTagsCascade();
      setProgress((p) => ({ ...p, tags: { done: tags.successful, total: tags.total, ok: tags.success } }));

      const inds = await regenerateBulkIndustriesCascade();
      setProgress((p) => ({ ...p, industries: { done: inds.successful, total: inds.total, ok: inds.success } }));

      const { articleIds, clientIds } = await getCascadeEntities();
      setProgress((p) => ({
        ...p,
        clients: { done: 0, total: clientIds.length, ok: false },
        articles: { done: 0, total: articleIds.length, ok: false },
      }));

      let clientOk = 0;
      for (let i = 0; i < clientIds.length; i += CONCURRENCY) {
        const chunk = clientIds.slice(i, i + CONCURRENCY);
        const results = await Promise.all(chunk.map((id) => regenerateOneClientCascade(id)));
        clientOk += results.filter((r) => r.success).length;
        setProgress((p) => ({ ...p, clients: { ...p.clients, done: i + chunk.length } }));
      }
      setProgress((p) => ({ ...p, clients: { done: clientIds.length, total: clientIds.length, ok: clientOk === clientIds.length } }));

      let articleOk = 0;
      for (let i = 0; i < articleIds.length; i += CONCURRENCY) {
        const chunk = articleIds.slice(i, i + CONCURRENCY);
        const results = await Promise.all(chunk.map((id) => regenerateOneArticleCascade(id)));
        articleOk += results.filter((r) => r.success).length;
        setProgress((p) => ({ ...p, articles: { ...p.articles, done: i + chunk.length } }));
      }
      setProgress((p) => ({ ...p, articles: { done: articleIds.length, total: articleIds.length, ok: articleOk === articleIds.length } }));

      const listings = await regenerateListingsCascade();
      setProgress((p) => ({ ...p, listings: { done: 1, total: 1, ok: listings.success } }));

      await finalizeCascadeRevalidation();

      setCompletedAt(Date.now());
      setState("done");
      toast({ title: "Cascade complete", description: `Regenerated in ${formatDuration(Date.now() - t0)}`, variant: "success" });
      startTransition(() => {
        // Trigger router refresh so KPIs reflect new state (no-op fn, transition wraps no work)
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setState("error");
      toast({ title: "Cascade failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold">🔄 Full Rebuild (Cascade)</h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">
              ~3-5 min · touches all entities
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Regenerates JSON-LD + Next.js metadata for every article, client, category, tag, industry, and listing.
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            <span className="font-medium">Use when:</span> you changed a global Setting (site URL, brand name, hreflang config) and want every page to pick it up.
          </p>
        </div>
        <StateBadge state={state} />
      </div>

      {state !== "idle" && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm tabular-nums">{percent}%</span>
              <span className="text-muted-foreground tabular-nums">
                {done.toLocaleString()} of {total.toLocaleString()} entities
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1 tabular-nums">
                <Clock className="h-3 w-3" />
                {formatDuration(liveElapsedMs)}
              </span>
              {etaMs !== null && (
                <span className="flex items-center gap-1 tabular-nums">
                  <Hourglass className="h-3 w-3" />
                  ~{formatDuration(etaMs)}
                </span>
              )}
            </div>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
      )}

      {state !== "idle" && <ProgressGrid progress={progress} state={state} />}

      {errorMsg && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-red-600 dark:text-red-300">{errorMsg}</div>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" onClick={runCascade} disabled={state === "running"}>
          {state === "running" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin me-1.5" />
              Running...
            </>
          ) : state === "error" ? (
            <>
              <Play className="h-3.5 w-3.5 me-1.5" />
              Retry Cascade
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 me-1.5" />
              {state === "done" ? "Run Again" : "Trigger Full Cascade"}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

function StateBadge({ state }: { state: CascadeState }) {
  if (state === "idle") {
    return <span className="text-[11px] text-muted-foreground">Idle</span>;
  }
  if (state === "running") {
    return (
      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
        <Loader2 className="h-3 w-3 animate-spin" />
        Running
      </span>
    );
  }
  if (state === "done") {
    return (
      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5">
        <CheckCircle2 className="h-3 w-3" />
        Complete
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium text-red-600 dark:text-red-300 flex items-center gap-1.5">
      <XCircle className="h-3 w-3" />
      Error
    </span>
  );
}

function ProgressGrid({ progress, state }: { progress: CascadeProgress; state: CascadeState }) {
  const phases = [
    { key: "categories", label: "Categories", value: progress.categories },
    { key: "tags", label: "Tags", value: progress.tags },
    { key: "industries", label: "Industries", value: progress.industries },
    { key: "clients", label: "Clients", value: progress.clients },
    { key: "articles", label: "Articles", value: progress.articles },
    { key: "listings", label: "Listings", value: progress.listings },
  ] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {phases.map((phase) => {
        const isRunning = state === "running" && phase.value.done < phase.value.total && phase.value.total > 0;
        const isDone = phase.value.done === phase.value.total && phase.value.total > 0 && phase.value.ok;
        const phasePercent = phase.value.total > 0 ? Math.round((phase.value.done / phase.value.total) * 100) : 0;
        return (
          <div
            key={phase.key}
            className={`rounded-md border p-2.5 text-xs space-y-1.5 ${
              isDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{phase.label}</span>
              <div className="flex items-center gap-1">
                {isRunning && <Loader2 className="h-3 w-3 animate-spin text-amber-500" />}
                {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
              </div>
            </div>
            <div className="font-mono tabular-nums">
              <span className={isDone ? "text-emerald-600 dark:text-emerald-300" : ""}>
                {phase.value.done}/{phase.value.total || "?"}
              </span>
            </div>
            {phase.value.total > 0 && (
              <Progress
                value={phasePercent}
                className="h-1"
                tone={isDone ? "default" : "default"}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
