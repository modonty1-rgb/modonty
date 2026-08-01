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
 *
 * Khalid's rule (2026-08-01): the 12 scopes are FOUR independent tasks run in order —
 * registered images must be 100% moved and verified before anything downstream runs.
 */

const BATCH = 5;

const TASKS: Array<{ key: string; n: string; title: string; scopes: MigrationScope[]; primary?: boolean }> = [
  { key: "move", n: "١", title: "نقل الصور المسجّلة", scopes: SCOPE_ORDER.slice(0, 3), primary: true },
  { key: "orphans", n: "٢", title: "الروابط اليتيمة", scopes: SCOPE_ORDER.slice(3, 4) },
  { key: "swap", n: "٣", title: "تبديل الروابط في الحقول", scopes: SCOPE_ORDER.slice(4, 5) },
  { key: "regen", n: "٤", title: "إعادة توليد السيو المخبوز", scopes: SCOPE_ORDER.slice(5) },
];

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
  const [pending, setPending] = useState<MigrationScope[] | null>(null);
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

  const start = async (requested: MigrationScope[]) => {
    setPending(null);
    cancelled.current = false;
    setRunning(true);
    setRuns({});

    // Fixed order — regenerating before the raw swap re-bakes the same Cloudinary URLs.
    const scopes = SCOPE_ORDER.filter((s) => requested.includes(s) && selected.has(s));

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
      title: cancelled.current ? "أُوقف" : "اكتمل التاسك",
      description: cancelled.current
        ? "توقّف بين الدفعات — المنجز محفوظ. أعد التشغيل للاستكمال."
        : "جارٍ إعادة الفحص…",
      variant: cancelled.current ? "destructive" : "default",
    });
    refresh();
  };

  if (loading && !stats) {
    return (
      <Card>
        <CardContent className="pt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> جارٍ فحص الحقول المخزّنة عن روابط Cloudinary…
        </CardContent>
      </Card>
    );
  }
  if (!stats) return null;

  const totalRows = stats.rawRows + stats.generatedRows;
  const clean = totalRows === 0 && stats.mediaWithoutBunny === 0;

  const renderScope = (scope: MigrationScope) => {
    const i = SCOPE_ORDER.indexOf(scope);
    const run = runs[scope];
    const isActive = activeScope === scope;
    return (
      <div key={scope} className="px-2.5 py-1.5 space-y-1">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id={`scope-${scope}`}
            checked={selected.has(scope)}
            onCheckedChange={() => toggle(scope)}
            disabled={running}
          />
          <label htmlFor={`scope-${scope}`} className="text-xs font-medium cursor-pointer flex-1 min-w-0">
            <span className="text-muted-foreground me-1.5 tabular-nums">{i + 1}.</span>
            {SCOPE_LABEL[scope]}
          </label>
          {run?.finished && (
            <span className="text-[10px] tabular-nums text-muted-foreground shrink-0" dir="ltr">
              {run.done} نجح{run.failed > 0 ? ` · ${run.failed} فشل` : ""}
            </span>
          )}
        </div>

        {(isActive || (run && !run.finished)) && run && (
          <TaskProgress active={isActive} current={run.done + run.failed} total={run.total} label={SCOPE_LABEL[scope]} />
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
  };

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
              <h2 className="text-sm font-semibold">الترحيل Cloudinary ← Bunny (مرة واحدة)</h2>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                أربعة تاسكات مستقلة تُنفَّذ بالترتيب — لا تنتقل لتاسك قبل اكتمال اللي قبله 100%
                والتحقق منه.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline" onClick={refresh} disabled={loading || running}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              إعادة فحص
            </Button>
            <Badge variant={clean ? "outline" : "destructive"}>
              {clean ? "نظيف" : `${totalRows} صفّاً`}
            </Badge>
          </div>
        </div>

        {!clean && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="روابط يتيمة" value={stats.orphanUrls} hint="بلا صفّ وسائط — تُعاد رفعاً" tone="red" />
            <Stat label="حقول خام" value={stats.rawRows} hint="يُبدَّل الرابط في مكانه" tone="amber" />
            <Stat label="سيو مولَّد" value={stats.generatedRows} hint="يُصلَح بإعادة التوليد" tone="blue" />
          </div>
        )}

        {stats.mediaWithoutBunny > 0 && (
          <p className="text-xs text-amber-600 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {stats.mediaWithoutBunny} صفّ وسائط ما زال بلا نسخة Bunny.
          </p>
        )}

        {/* الأربعة تاسكات — كل واحد بزرّه المستقل */}
        {TASKS.map((t) => (
          <div key={t.key} dir="rtl" className="rounded-lg border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-3 py-1.5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-600 text-xl font-bold text-white">
                  {t.n}
                </span>
                <p className="text-[13px] font-bold">{t.title}</p>
              </div>
              {!running &&
                (pending === t.scopes ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[11px] text-destructive">يكتب في قاعدة البيانات — متأكد؟</span>
                    <Button size="sm" variant="destructive" onClick={() => void start(t.scopes)}>
                      <Play className="h-3.5 w-3.5" />
                      نعم، شغّل
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant={t.primary ? "default" : "outline"}
                    disabled={!!pending}
                    onClick={() => setPending(t.scopes)}
                    className="shrink-0"
                  >
                    <Play className="h-3.5 w-3.5" />
                    شغّل هذا التاسك
                  </Button>
                ))}
            </div>
            <div className="divide-y">{t.scopes.map(renderScope)}</div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-2" dir="rtl">
          {running ? (
            <>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  cancelled.current = true;
                }}
              >
                <Square className="h-3.5 w-3.5" />
                إيقاف
              </Button>
              <span className="text-[11px] text-muted-foreground">
                الإيقاف يسري بعد الدفعة الحالية ({BATCH} عناصر) — المنجز محفوظ.
              </span>
            </>
          ) : null}
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
