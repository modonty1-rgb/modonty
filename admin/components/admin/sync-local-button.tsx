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

interface CollectionState {
  name: string;
  status: "pending" | "running" | "done" | "failed";
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
  failedCount: number;
  durationMs?: number;
  fatalError?: string;
}

const INITIAL_PROGRESS: ProgressState = {
  total: 0,
  current: 0,
  currentName: "",
  currentDocs: 0,
  collections: [],
  totalDocs: 0,
  successCount: 0,
  failedCount: 0,
};

export function SyncLocalButton() {
  // Inlined at build — completely removed from production bundle
  if (process.env.NODE_ENV === "production") return null;

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
          break;

        case "fatal":
          next.fatalError = event.error as string;
          break;
      }

      return next;
    });

    if (event.type === "complete") {
      setPhase("done");
      toast({
        title: "تمت المزامنة",
        description: `${event.successCount} جدول · ${event.totalDocs} وثيقة (${((event.durationMs as number) / 1000).toFixed(1)}s)`,
      });
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
                {phase === "running" && "جارٍ المزامنة..."}
                {phase === "done" && "اكتملت المزامنة"}
                {phase === "error" && "فشلت المزامنة"}
              </DialogTitle>
            </DialogHeader>

            {progress.fatalError ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                {progress.fatalError}
              </div>
            ) : (
              <div className="space-y-3">
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
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-500/10 rounded-md p-2">
                    <div className="text-emerald-600 dark:text-emerald-400 text-lg font-bold">
                      {progress.successCount}
                    </div>
                    <div className="text-muted-foreground">نجح</div>
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
