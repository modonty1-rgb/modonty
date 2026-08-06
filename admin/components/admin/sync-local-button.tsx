"use client";

import { useState } from "react";
import {
  Database,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Phase = "idle" | "confirm" | "running" | "done" | "error";

// Kept in sync with SKIP_COLLECTIONS in the sync route. Shown to the user so they know
// exactly which heavy event/fallback tables are copied EMPTY (indexes only) to save time.
const EXCLUDED_TABLES = [
  "page_views",
  "article_views",
  "client_views",
  "analytics",
  "engagement_duration",
  "article_link_clicks",
  "cta_clicks",
  "shares",
  "conversions",
  "campaign_tracking",
  "lead_scoring",
  "email_events",
];

interface CollectionState {
  name: string;
  status: "pending" | "running" | "done" | "skipped" | "failed";
  docs?: number;
  error?: string;
}

interface ProgressState {
  total: number;
  current: number;
  currentName: string;
  currentDocs: number;
  collections: CollectionState[];
  totalDocs: number;
  successCount: number;
  skippedCount: number;
  failedCount: number;
  durationMs?: number;
  fatalError?: string;
  /** Post-copy integrity check — a copy that reads fine is not the same as a copy that is correct. */
  verifying?: boolean;
  relationsScanned?: number;
  totalOrphans?: number;
  orphanFindings?: { key: string; count: number; where: string; sampleIds: string[] }[];
  /** False when a collection failed or the copy left orphans — do not test against it. */
  usable?: boolean;
}

const INITIAL_PROGRESS: ProgressState = {
  total: 0,
  current: 0,
  currentName: "",
  currentDocs: 0,
  collections: [],
  totalDocs: 0,
  successCount: 0,
  skippedCount: 0,
  failedCount: 0,
};

export function SyncLocalButton({ enabled }: { enabled: boolean }) {
  // Visibility follows the DATABASE the instance is on, not the bundle it was built with.
  // The migration rehearsal runs a production build against the local test database, and a
  // NODE_ENV check hid this button exactly when it was needed. The route itself refuses any
  // database other than modonty_dev, so this is presentation, not protection.
  if (!enabled) return null;

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<ProgressState>(INITIAL_PROGRESS);
  const { toast } = useToast();

  function reset() {
    setPhase("idle");
    setProgress(INITIAL_PROGRESS);
  }

  function handleOpenChange(o: boolean) {
    setOpen(o);
    if (!o) reset();
  }

  async function startSync() {
    setPhase("running");
    setProgress({ ...INITIAL_PROGRESS });

    try {
      const res = await fetch("/api/dev/sync-local-from-prod", {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown" }));
        setPhase("error");
        setProgress((p) => ({
          ...p,
          fatalError: err.error || `HTTP ${res.status}`,
        }));
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep last partial line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            handleEvent(event);
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (error) {
      setPhase("error");
      setProgress((p) => ({
        ...p,
        fatalError:
          error instanceof Error ? error.message : "Network error",
      }));
    }
  }

  function handleEvent(event: { type: string; [key: string]: unknown }) {
    setProgress((p) => {
      const next = { ...p };

      switch (event.type) {
        case "start":
          next.total = event.total as number;
          next.collections = [];
          break;

        case "collection_start":
          next.current = event.index as number;
          next.currentName = event.name as string;
          next.currentDocs = 0;
          // Add new collection in 'running' state
          next.collections = [
            ...next.collections,
            { name: event.name as string, status: "running" },
          ];
          break;

        case "doc_progress":
          next.currentDocs = event.docs as number;
          break;

        case "verifying":
          next.verifying = true;
          break;

        case "verified":
          next.verifying = false;
          next.relationsScanned = event.relationsScanned as number;
          next.totalOrphans = event.totalOrphans as number;
          next.orphanFindings = event.findings as ProgressState["orphanFindings"];
          break;

        case "collection_done": {
          const docs = event.docs as number;
          next.totalDocs += docs;
          next.successCount += 1;
          next.collections = next.collections.map((c) =>
            c.name === event.name
              ? { ...c, status: "done", docs }
              : c
          );
          break;
        }

        case "collection_skipped":
          next.skippedCount += 1;
          next.collections = next.collections.map((c) =>
            c.name === event.name
              ? { ...c, status: "skipped" }
              : c
          );
          break;

        case "collection_failed":
          next.failedCount += 1;
          next.collections = next.collections.map((c) =>
            c.name === event.name
              ? { ...c, status: "failed", error: event.error as string }
              : c
          );
          break;

        case "complete":
          next.durationMs = event.durationMs as number;
          next.usable = event.usable as boolean;
          break;

        case "fatal":
          next.fatalError = event.error as string;
          break;
      }

      return next;
    });

    if (event.type === "complete") {
      // A copy that finished is not automatically a copy you can use. Saying "تمت" over a
      // database with broken rows is what sends someone hunting a bug that came from here.
      const orphans = (event.totalOrphans as number) ?? 0;
      const failed = (event.failedCount as number) ?? 0;
      const seconds = ((event.durationMs as number) / 1000).toFixed(1);
      setPhase(event.usable ? "done" : "error");

      if (event.usable) {
        toast({
          title: "تمت المزامنة — النسخة سليمة",
          description: `${event.successCount} جدول · ${event.totalDocs} وثيقة · صفر صفوف مكسورة (${seconds}s)`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "المزامنة خلصت — لكن النسخة فيها خلل",
          description:
            [
              failed > 0 ? `${failed} جدول ما انتسخ` : null,
              orphans > 0 ? `${orphans} صفّاً مكسوراً (يشير لشي غير موجود)` : null,
            ]
              .filter(Boolean)
              .join(" · ") + " — راجع التفاصيل تحت قبل ما تختبر عليها.",
        });
      }
    }

    if (event.type === "fatal") {
      setPhase("error");
      toast({
        title: "فشل تام",
        description: event.error as string,
        variant: "destructive",
      });
    }
  }

  const percentage =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="نسخ بيانات الإنتاج إلى التطوير المحلي (DEV فقط)"
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
        >
          <Database className="h-3.5 w-3.5" />
          <span>Sync Local from PROD</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        {phase === "idle" || phase === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                مزامنة قاعدة البيانات المحلية من الإنتاج
              </DialogTitle>
              <DialogDescription className="space-y-2 pt-2">
                <span className="block">
                  هذه العملية ستحذف <strong>كل البيانات الحالية</strong> في{" "}
                  <code className="bg-muted rounded px-1">modonty_dev</code>{" "}
                  وتستبدلها بنسخة طبق الأصل من الإنتاج.
                </span>
                <span className="block text-emerald-600 dark:text-emerald-400">
                  ✓ آمن: الإنتاج مصدر قراءة فقط — لا تعديل عليه.
                </span>
                <span className="block text-amber-600 dark:text-amber-400">
                  ⚠️ تنبيه: أي تغييرات محلية لم تُنشر سيتم فقدها.
                </span>
              </DialogDescription>
            </DialogHeader>

            {/* Excluded tables — copied empty (indexes only) to save sync time */}
            <div className="rounded-md border border-slate-500/25 bg-slate-500/[0.06] p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Database className="h-3.5 w-3.5" />
                جداول مُستثناة ({EXCLUDED_TABLES.length}) — تُنسخ فارغة لتوفير الوقت
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                جداول أحداث ضخمة (صف لكل زيارة/ضغطة) مصدرها الحقيقي GA4 أو مجرد احتياطي —
                نسخها كان يلتهم وقت المزامنة بلا فائدة للتطوير المحلي. تُنشأ فارغة (مع الفهارس)
                فالاستعلام عليها يرجّع صفراً بلا خطأ.
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {EXCLUDED_TABLES.map((t) => (
                  <code
                    key={t}
                    className="rounded bg-slate-500/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                  >
                    {t}
                  </code>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={startSync}>تأكيد · بدء المزامنة</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {phase === "running" && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
                {phase === "done" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {phase === "error" && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {phase === "running" && (progress.verifying ? "نفحص سلامة النسخة..." : "جارٍ المزامنة...")}
                {phase === "done" && "اكتملت المزامنة — النسخة سليمة"}
                {phase === "error" && (progress.usable === false ? "النسخة فيها خلل" : "فشلت المزامنة")}
              </DialogTitle>
            </DialogHeader>

            {progress.fatalError ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                {progress.fatalError}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Integrity result — the part that decides whether this copy is usable */}
                {progress.totalOrphans !== undefined && (
                  <div
                    className={`rounded-md border p-3 text-sm ${
                      progress.totalOrphans === 0
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    {progress.totalOrphans === 0 ? (
                      <p className="font-medium">
                        ✅ فحص السلامة: {progress.relationsScanned} علاقة إجبارية — صفر صفوف مكسورة.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium">
                          ⚠️ {progress.totalOrphans} صفّاً يشير لشي غير موجود — أي صفحة تقرأه بتقع.
                        </p>
                        <ul className="space-y-1 text-xs">
                          {progress.orphanFindings?.map((f) => (
                            <li key={f.key} dir="ltr" className="text-start font-mono">
                              {f.where} — {f.count}
                              {f.sampleIds.length > 0 && (
                                <span className="opacity-70"> · {f.sampleIds.slice(0, 3).join(", ")}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs opacity-90">
                          نظّفها من صفحة الصيانة (خطوة Orphan Rows) قبل ما تختبر على هذه النسخة.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>
                      {progress.current} / {progress.total} جدول
                    </span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Current state */}
                {phase === "running" && progress.currentName && (
                  <div className="bg-muted/50 rounded-md p-2 text-sm">
                    <div className="text-muted-foreground text-xs">
                      الجدول الحالي:
                    </div>
                    <div className="font-mono text-xs">
                      {progress.currentName}
                    </div>
                    {progress.currentDocs > 0 && (
                      <div className="text-muted-foreground mt-0.5 text-xs">
                        {progress.currentDocs.toLocaleString()} وثيقة...
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-emerald-500/10 rounded-md p-2">
                    <div className="text-emerald-600 dark:text-emerald-400 text-lg font-bold">
                      {progress.successCount}
                    </div>
                    <div className="text-muted-foreground">نجح</div>
                  </div>
                  <div className="bg-slate-500/10 rounded-md p-2">
                    <div className="text-slate-600 dark:text-slate-400 text-lg font-bold">
                      {progress.skippedCount}
                    </div>
                    <div className="text-muted-foreground">تُخطّي</div>
                  </div>
                  <div className="bg-red-500/10 rounded-md p-2">
                    <div className="text-red-600 dark:text-red-400 text-lg font-bold">
                      {progress.failedCount}
                    </div>
                    <div className="text-muted-foreground">فشل</div>
                  </div>
                  <div className="bg-primary/10 rounded-md p-2">
                    <div className="text-primary text-lg font-bold">
                      {progress.totalDocs.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">وثيقة</div>
                  </div>
                </div>

                {/* Collection list (scrollable) */}
                <div className="bg-muted/30 max-h-64 overflow-y-auto rounded-md border p-2">
                  {progress.collections.length === 0 ? (
                    <div className="text-muted-foreground py-4 text-center text-xs">
                      جارٍ تحضير قائمة الجداول...
                    </div>
                  ) : (
                    progress.collections.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center justify-between py-1 text-xs"
                      >
                        <span className="font-mono">{c.name}</span>
                        <span className="flex items-center gap-1">
                          {c.status === "running" && (
                            <Loader2 className="text-primary h-3 w-3 animate-spin" />
                          )}
                          {c.status === "done" && (
                            <>
                              <span className="text-muted-foreground">
                                {c.docs}
                              </span>
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            </>
                          )}
                          {c.status === "skipped" && (
                            <span className="text-[10px] font-medium text-slate-500">
                              مُستثنى (فارغ)
                            </span>
                          )}
                          {c.status === "failed" && (
                            <>
                              <span
                                className="text-red-500"
                                title={c.error}
                              >
                                خطأ
                              </span>
                              <XCircle className="h-3 w-3 text-red-500" />
                            </>
                          )}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Final summary */}
                {phase === "done" && (
                  <div className="border-emerald-500/30 bg-emerald-500/10 rounded-md border p-3 text-center text-sm">
                    <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                      ✓ اكتملت في{" "}
                      {((progress.durationMs ?? 0) / 1000).toFixed(1)} ثانية
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      الصفحة ستحدّث تلقائياً للتأكد من الـ Server Components
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              {phase === "running" ? (
                <Button disabled>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  جارٍ...
                </Button>
              ) : phase === "done" ? (
                <Button onClick={() => window.location.reload()}>
                  تحديث الصفحة
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setOpen(false)}>
                  إغلاق
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
