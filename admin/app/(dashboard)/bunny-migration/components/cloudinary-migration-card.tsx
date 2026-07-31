"use client";

import { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Play,
  Square,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TaskProgress } from "@/components/admin/task-progress";

import {
  getMigrationStats,
  listScope,
  runScopeBatch,
  type MigrationStats,
} from "../actions/cloudinary-to-bunny";
import { SCOPE_ORDER, SCOPE_LABEL, type MigrationScope } from "../actions/cloudinary-scopes";

/**
 * One-time Cloudinary → Bunny migration, split by scope and driven from the client.
 *
 * The client loops over batches instead of calling one long server action, which is what
 * makes a real percentage and a working Cancel possible — a server action is atomic from
 * the browser's side, so neither is achievable inside one. Cancel takes effect at the next
 * batch boundary; work already committed stays committed (each batch is independent and
 * idempotent, so a cancelled run is simply a partial one you can resume).
 */

const BATCH = 5;

interface ScopeRun {
  total: number;
  done: number;
  failed: number;
  errors: string[];
  finished: boolean;
}

export function CloudinaryMigrationCard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeScope, setActiveScope] = useState<MigrationScope | null>(null);
  const [runs, setRuns] = useState<Partial<Record<MigrationScope, ScopeRun>>>({});
  const [selected, setSelected] = useState<Set<MigrationScope>>(new Set(SCOPE_ORDER));
  const cancelled = useRef(false);

  const refresh = () => {
    setLoading(true);
    getMigrationStats()
      .then(setStats)
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const toggle = (s: MigrationScope) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const start = async () => {
    setConfirming(false);
    cancelled.current = false;
    setRunning(true);
    setRuns({});

    // Fixed order — regenerating before the raw swap re-bakes the same Cloudinary URLs.
    const scopes = SCOPE_ORDER.filter((s) => selected.has(s));

    for (const scope of scopes) {
      if (cancelled.current) break;
      setActiveScope(scope);

      const { ids } = await listScope(scope);
      setRuns((r) => ({
        ...r,
        [scope]: { total: ids.length, done: 0, failed: 0, errors: [], finished: ids.length === 0 },
      }));
      if (ids.length === 0) continue;

      for (let i = 0; i < ids.length; i += BATCH) {
        if (cancelled.current) break;
        const slice = ids.slice(i, i + BATCH);
        const r = await runScopeBatch(scope, slice);
        setRuns((prev) => {
          const cur = prev[scope]!;
          return {
            ...prev,
            [scope]: {
              ...cur,
              done: cur.done + r.done,
              failed: cur.failed + r.failed,
              errors: [...cur.errors, ...r.errors].slice(0, 5),
            },
          };
        });
      }

      setRuns((prev) => ({ ...prev, [scope]: { ...prev[scope]!, finished: true } }));
    }

    setActiveScope(null);
    setRunning(false);
    toast({
      title: cancelled.current ? "Cancelled" : "Migration finished",
      description: cancelled.current
        ? "Stopped between batches — completed work was kept. Re-run to continue."
        : "Rescanning…",
      variant: cancelled.current ? "destructive" : "default",
    });
    refresh();
  };

  if (loading && !stats) {
    return (
      <Card>
        <CardContent className="pt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Scanning stored fields for Cloudinary URLs…
        </CardContent>
      </Card>
    );
  }
  if (!stats) return null;

  const totalRows = stats.rawRows + stats.generatedRows;
  const clean = totalRows === 0 && stats.mediaWithoutBunny === 0;

  return (
    <Card className={clean ? "border-emerald-500/30" : "border-amber-500/40"}>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${
                clean ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
              }`}
            >
              {clean ? <CheckCircle2 className="h-5 w-5" /> : <CloudOff className="h-5 w-5" />}
            </span>
            <div>
              <h2 className="text-sm font-semibold">Cloudinary → Bunny (one-time)</h2>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                Pick the scopes to run. They always execute in the fixed order below — regenerating
                before the raw swap would re-bake the same Cloudinary URLs, because the generators
                read <code className="text-[11px]">socialImage</code> but never write it.
              </p>
            </div>
          </div>
          <Badge variant={clean ? "outline" : "destructive"} className="shrink-0">
            {clean ? "Clean" : `${totalRows} rows`}
          </Badge>
        </div>

        {!clean && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Orphan URLs" value={stats.orphanUrls} hint="no Media row — re-uploaded" tone="red" />
            <Stat label="Raw fields" value={stats.rawRows} hint="URL swapped in place" tone="amber" />
            <Stat label="Generated" value={stats.generatedRows} hint="fixed by regeneration" tone="blue" />
          </div>
        )}

        {stats.mediaWithoutBunny > 0 && (
          <p className="text-xs text-amber-600 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {stats.mediaWithoutBunny} Media row(s) still have no Bunny copy.
          </p>
        )}

        {/* scope picker + per-scope progress */}
        <div className="rounded-md border divide-y">
          {SCOPE_ORDER.map((scope, i) => {
            const run = runs[scope];
            const isActive = activeScope === scope;
            return (
              <div key={scope} className="p-2.5 space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id={`scope-${scope}`}
                    checked={selected.has(scope)}
                    onCheckedChange={() => toggle(scope)}
                    disabled={running}
                  />
                  <label
                    htmlFor={`scope-${scope}`}
                    className="text-xs font-medium cursor-pointer flex-1 min-w-0"
                  >
                    <span className="text-muted-foreground me-1.5 tabular-nums">{i + 1}.</span>
                    {SCOPE_LABEL[scope]}
                  </label>
                  {run?.finished && (
                    <span className="text-[10px] tabular-nums text-muted-foreground shrink-0" dir="ltr">
                      {run.done} ok{run.failed > 0 ? ` · ${run.failed} failed` : ""}
                    </span>
                  )}
                </div>

                {(isActive || (run && !run.finished)) && run && (
                  <TaskProgress
                    active={isActive}
                    current={run.done + run.failed}
                    total={run.total}
                    label={SCOPE_LABEL[scope]}
                  />
                )}

                {run && run.errors.length > 0 && (
                  <ul className="space-y-0.5 ps-6">
                    {run.errors.map((e, k) => (
                      <li key={k} className="text-[10px] text-destructive truncate" dir="ltr">
                        {e}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {running ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                cancelled.current = true;
              }}
            >
              <Square className="h-3.5 w-3.5" />
              Cancel
            </Button>
          ) : confirming ? (
            <>
              <Button size="sm" variant="destructive" onClick={start}>
                <Play className="h-3.5 w-3.5" />
                Yes, run {selected.size} scope{selected.size === 1 ? "" : "s"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <span className="text-[11px] text-destructive">Writes to the database.</span>
            </>
          ) : (
            <>
              <Button size="sm" disabled={selected.size === 0} onClick={() => setConfirming(true)}>
                <Play className="h-3.5 w-3.5" />
                Run selected
              </Button>
              <Button size="sm" variant="ghost" onClick={refresh}>
                <RefreshCw className="h-3.5 w-3.5" />
                Rescan
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set(SCOPE_ORDER))}>
                <Search className="h-3.5 w-3.5" />
                Select all
              </Button>
            </>
          )}
          {running && (
            <span className="text-[11px] text-muted-foreground">
              Cancel takes effect after the current batch of {BATCH}; finished work is kept.
            </span>
          )}
        </div>

        {stats.rawFields.length > 0 && <FieldList title="Raw fields" items={stats.rawFields} />}
        {stats.generatedFields.length > 0 && (
          <FieldList title="Generated fields" items={stats.generatedFields} />
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone: "red" | "amber" | "blue";
}) {
  const tones = { red: "text-red-600", amber: "text-amber-600", blue: "text-blue-600" } as const;
  return (
    <div className="rounded-md border p-2.5">
      <div className={`text-xl font-bold ${tones[tone]}`}>{value}</div>
      <div className="text-[11px] font-medium mt-0.5">{label}</div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function FieldList({ title, items }: { title: string; items: Array<{ field: string; rows: number }> }) {
  return (
    <div>
      <p className="text-[11px] font-medium mb-1">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((f) => (
          <span
            key={f.field}
            className="inline-flex items-center gap-1 rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono"
            dir="ltr"
          >
            {f.field}
            <span className="font-sans font-semibold text-muted-foreground">{f.rows}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
