"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Phase = "idle" | "loading" | "running" | "done" | "error";

interface Planned {
  clientId: string;
  clientName: string;
  planName: string | null;
  planSlug: string | null;
  articlesPerMonth: number | null;
  market: string | null;
  currency: string | null;
  totalMinor: number;
  paidMonths: number;
  serviceStartedAt: string | null;
  gaps: string[];
}

interface Totals {
  clients: number;
  clean: number;
  needsReview: number;
  byCurrency: Record<string, { count: number; totalMinor: number }>;
}

interface DryRun {
  willDelete: Record<string, number>;
  planned: Planned[];
  totals: Totals;
}

interface RunResult {
  clean: boolean;
  deleted: Record<string, number>;
  created: number;
  failed: { clientName: string; error: string }[];
  verify: { clients: number; orders: number; ordersLinked: number; clientsPointing: number };
  needsReview: { number: string; clientName: string; currency: string | null; totalMinor: number; gaps: string[] }[];
  totals: Totals;
  durationMs: number;
}

const money = (minor: number, currency: string | null) =>
  `${(minor / 100).toLocaleString("en-US")} ${currency ?? "—"}`;

/**
 * إعادةُ بناء الطلبات — إخلاءٌ وترحيلٌ في ضغطةٍ واحدة.
 *
 * تُعرض المعاينةُ أوّلاً ولا تُكتب: نفسُ الدالّة في المسار تحسب المعاينةَ والتنفيذ،
 * فما يُقرأ هنا هو ما يُكتب هناك. وجدولُ «يحتاج مراجعة» يُعرض قبل الضغط وبعده معاً —
 * لأنّ المقصود منه أن يُقرأ لا أن يُبتلع.
 */
export function RebuildOrdersDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [dry, setDry] = useState<DryRun | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * الوضعُ الجافّ يُجلب على تغيّر `open` لا داخل `onOpenChange`.
   *
   * قائمةُ الأدوات تفتح النافذة بضبط `open` مباشرةً (`setRebuildOpen(true)`) فلا يمرّ
   * الفتحُ بـ`onOpenChange` أصلاً — وكان الجلبُ هناك، فبقيت النافذة على «...» بلا زرّ
   * تأكيدٍ للأبد (١٨ سبتمبر ٢٠٢٦). الحالةُ تُشتقّ من الخاصّيّة، لا من طريق فتحها.
   */
  useEffect(() => {
    if (!open) {
      setPhase("idle");
      setDry(null);
      setResult(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setPhase("loading");
    (async () => {
      try {
        const res = await fetch("/api/dev/rebuild-orders");
        if (cancelled) return;
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          setError(err.error ?? `HTTP ${res.status}`);
          setPhase("error");
          return;
        }
        setDry(await res.json());
        setPhase("idle");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Network error");
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  function handleOpenChange(o: boolean) {
    onOpenChange(o);
  }

  async function run() {
    setPhase("running");
    try {
      const res = await fetch("/api/dev/rebuild-orders", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setError(err.error ?? `HTTP ${res.status}`);
        setPhase("error");
        toast({ variant: "destructive", title: "رُفضت العمليّة", description: err.error });
        return;
      }
      const data: RunResult = await res.json();
      setResult(data);
      setPhase(data.clean ? "done" : "error");
      toast({
        variant: data.clean ? undefined : "destructive",
        title: data.clean ? "أُعيد بناء الطلبات" : "البناء لم يكتمل",
        description: data.clean
          ? `${data.created} طلباً · ${data.totals.needsReview} يحتاج مراجعة · ${(data.durationMs / 1000).toFixed(1)}s`
          : "راجع التفاصيل — العدُّ بعد البناء لا يطابق عدد العملاء.",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setPhase("error");
    }
  }

  const totals = result?.totals ?? dry?.totals ?? null;
  const reviewRows =
    result?.needsReview.map((r) => ({ name: r.clientName, currency: r.currency, totalMinor: r.totalMinor, gaps: r.gaps })) ??
    dry?.planned.filter((p) => p.gaps.length > 0).map((p) => ({ name: p.clientName, currency: p.currency, totalMinor: p.totalMinor, gaps: p.gaps })) ??
    [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {phase === "running" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {phase === "done" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            {phase === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            {(phase === "idle" || phase === "loading") && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {phase === "running" && "جارٍ إعادة البناء..."}
            {phase === "done" && "أُعيد بناء الطلبات"}
            {phase === "error" && "لم تكتمل"}
            {(phase === "idle" || phase === "loading") && "إعادة بناء الطلبات من بيانات العملاء"}
          </DialogTitle>
          {(phase === "idle" || phase === "loading") && (
            <DialogDescription className="space-y-1.5 pt-2">
              <span className="block">
                تُحذف كل الطلبات والفواتير، ثم يُصنع لكل عميل طلبٌ من بياناته القائمة
                (الباقة · الحصة · الرصيد الافتتاحي · دورة الفوترة).
              </span>
              <span className="block text-emerald-600 dark:text-emerald-400">
                ✓ لا يُعدَّل عميل ولا يُحذف — إنشاءٌ فقط، ومؤشر الطلب الساري يُضبط.
              </span>
              <span className="block text-amber-600 dark:text-amber-400">
                ⚠️ ما لا يُعرف يُكتب صفراً ويُوسم «يحتاج مراجعة» — لا يُخمَّن.
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        {error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : phase === "loading" ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            نحسب ما سيُكتب لكل عميل...
          </div>
        ) : phase === "running" ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            نمسح ونبني...
          </div>
        ) : (
          <div className="space-y-3">
            {totals && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-primary/10 p-2">
                  <div className="text-primary text-lg font-bold">{totals.clients}</div>
                  <div className="text-muted-foreground">عميلاً</div>
                </div>
                <div className="rounded-md bg-emerald-500/10 p-2">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{totals.clean}</div>
                  <div className="text-muted-foreground">طلبٌ كامل</div>
                </div>
                <div className="rounded-md bg-amber-500/10 p-2">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{totals.needsReview}</div>
                  <div className="text-muted-foreground">يحتاج مراجعة</div>
                </div>
              </div>
            )}

            {totals && (
              <div className="rounded-md border p-2.5">
                <div className="text-muted-foreground text-xs font-semibold">المبالغ — لا تُجمع عبر العملات</div>
                <div className="mt-1.5 flex flex-wrap gap-3">
                  {Object.entries(totals.byCurrency).map(([cur, v]) => (
                    <span key={cur} className="text-xs">
                      <code className="font-mono">{cur}</code>{" "}
                      <span className="text-muted-foreground">{v.count} عميلاً =</span>{" "}
                      <b className="tabular-nums">{(v.totalMinor / 100).toLocaleString("en-US")}</b>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* التحقّق البعديّ — العدّ المُعاد هو الدليل */}
            {result && (
              <div
                className={`rounded-md border p-3 text-sm ${
                  result.clean
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
                }`}
              >
                <p className="font-medium">
                  {result.clean ? "✅" : "⚠️"} العدّ بعد البناء: {result.verify.orders} طلباً ·{" "}
                  {result.verify.ordersLinked} مربوطاً بعميل · {result.verify.clientsPointing} عميلاً يشير لطلبه ·
                  من {result.verify.clients} عميلاً
                  {" · "}
                  {(result.durationMs / 1000).toFixed(1)} ثانية
                </p>
                {result.failed.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-xs">
                    {result.failed.map((f) => (
                      <li key={f.clientName}>
                        {f.clientName} — {f.error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {reviewRows.length > 0 && (
              <details open className="rounded-md border border-amber-500/30 p-2">
                <summary className="cursor-pointer text-xs font-semibold text-amber-700 dark:text-amber-400">
                  يحتاج مراجعة يدويّة ({reviewRows.length})
                </summary>
                <div className="mt-2 max-h-72 overflow-y-auto">
                  {reviewRows.map((r) => (
                    <div key={r.name} className="border-b py-1.5 last:border-0">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="truncate font-medium">{r.name}</span>
                        <span className="font-mono whitespace-nowrap tabular-nums">
                          {money(r.totalMinor, r.currency)}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-[11px]">{r.gaps.join(" · ")}</div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        <DialogFooter>
          {phase === "running" ? (
            <Button disabled>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              جارٍ...
            </Button>
          ) : phase === "done" || phase === "error" ? (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                إغلاق
              </Button>
              <Button onClick={() => window.location.reload()}>تحديث الصفحة</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={run} disabled={phase === "loading" || !dry}>
                {dry ? `تأكيد · امسح وابنِ ${dry.totals.clients} طلباً` : "..."}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
