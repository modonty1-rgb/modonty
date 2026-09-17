"use client";

import { useState } from "react";
import { Eraser, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
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

type Phase = "idle" | "loading" | "running" | "done" | "error";

interface InvoiceRow {
  number: string | null;
  paymentStatus: string | null;
  currency: string | null;
  amount: number | null;
  tierName: string | null;
  client: { name: string | null } | null;
}

interface WipeResult {
  clean: boolean;
  deleted: Record<string, number>;
  remaining: Record<string, number>;
  kept: Record<string, number>;
  failed: { name: string; error: string }[];
  invoiceLog: InvoiceRow[];
  durationMs: number;
}

interface Inventory {
  willDelete: Record<string, number>;
  kept: Record<string, number>;
}

/**
 * إخلاء الطلبات والفواتير — قاعدةُ الاختبار وحدها.
 *
 * يقف جنبَ زرّ المزامنة لأنّهما خطوتان في عملٍ واحد: تُجلب نسخةُ الإنتاج، ثمّ تُخلى
 * الطلباتُ لتبدأ تجربةُ الترحيل من صفحةٍ بيضاء. وبلا إخلاءٍ نظيف تختلط نتيجةُ التجربة
 * السابقة بالجديدة فلا يُعرف أيُّها صنعه الترحيل.
 *
 * `enabled` عرضٌ لا حماية — المسار نفسه يرفض أيّ قاعدةٍ غير `modonty_dev`.
 */
export function WipeOrdersButton({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [result, setResult] = useState<WipeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleOpenChange(o: boolean) {
    setOpen(o);
    if (!o) {
      setPhase("idle");
      setInventory(null);
      setResult(null);
      setError(null);
      return;
    }

    // يُعرض العددُ الحقيقيّ قبل التأكيد. رقمٌ مكتوبٌ في الواجهة سلفاً يكذب أوّلَ ما
    // تتغيّر القاعدة — والقاعدة هنا تُستبدل كلَّ دورة مزامنة.
    setPhase("loading");
    try {
      const res = await fetch("/api/dev/wipe-orders");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setError(err.error ?? `HTTP ${res.status}`);
        setPhase("error");
        return;
      }
      setInventory(await res.json());
      setPhase("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setPhase("error");
    }
  }

  async function startWipe() {
    setPhase("running");
    try {
      const res = await fetch("/api/dev/wipe-orders", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setError(err.error ?? `HTTP ${res.status}`);
        setPhase("error");
        toast({ variant: "destructive", title: "رُفض الإخلاء", description: err.error });
        return;
      }
      const data: WipeResult = await res.json();
      setResult(data);
      setPhase(data.clean ? "done" : "error");

      const total = Object.values(data.deleted).reduce((a, b) => a + b, 0);
      if (data.clean) {
        toast({
          title: "أُخليت الطلبات",
          description: `${total} صفّاً حُذف · العملاء والمحتمَلون كما هم (${(data.durationMs / 1000).toFixed(1)}s)`,
        });
      } else {
        // «تمّ» على قاعدةٍ ما زال فيها صفوف هو ما يُرسل أحداً يطارد خطأً مصدرُه هنا.
        toast({
          variant: "destructive",
          title: "الإخلاء لم يكتمل",
          description: "بقيت صفوف — راجع التفاصيل قبل ما تشغّل الترحيل.",
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setPhase("error");
    }
  }

  const willDeleteTotal = inventory
    ? Object.values(inventory.willDelete).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* أيقونة فقط، بنفس مقاس زرّ المزامنة الذي يجاوره. الحمرةُ تميّزه عنه: ذاك يجلب
          بيانات، وهذا يمحوها — ولا يصحّ أن يتشابها في الشريط. */}
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Wipe orders and invoices from the test database"
          title="إخلاء الطلبات والفواتير (قاعدة الاختبار فقط)"
          className="inline-flex size-8 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400"
        >
          <Eraser className="size-4" aria-hidden />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        {phase === "idle" || phase === "loading" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                إخلاء الطلبات والفواتير
              </DialogTitle>
              <DialogDescription className="space-y-2 pt-2">
                <span className="block">
                  تُحذف كل الطلبات والفواتير وما تفرّع عنها من{" "}
                  <code className="bg-muted rounded px-1">modonty_dev</code> — لتبدأ تجربة
                  الترحيل من صفحة بيضاء.
                </span>
                <span className="block text-emerald-600 dark:text-emerald-400">
                  ✓ لا يُمسّ: العملاء · المحتمَلون · الموظّفون · المقالات.
                </span>
                <span className="block text-amber-600 dark:text-amber-400">
                  ⚠️ لا رجوع — لكن مزامنة الإنتاج تُرجع كل شيء في ~٢.٥ دقيقة.
                </span>
              </DialogDescription>
            </DialogHeader>

            {phase === "loading" ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                نعدّ ما في القاعدة الآن...
              </div>
            ) : inventory ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-red-500/25 bg-red-500/[0.06] p-3">
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                    سيُحذف ({willDeleteTotal} صفّاً)
                  </div>
                  <div className="mt-2 space-y-1">
                    {Object.entries(inventory.willDelete).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <code className="font-mono text-[11px]">{k}</code>
                        <span className={v > 0 ? "font-bold" : "text-muted-foreground"}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.06] p-3">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    يبقى كما هو
                  </div>
                  <div className="mt-2 space-y-1">
                    {Object.entries(inventory.kept).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <code className="font-mono text-[11px]">{k}</code>
                        <span className="font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={startWipe}
                disabled={phase === "loading" || willDeleteTotal === 0}
              >
                {willDeleteTotal === 0 ? "لا شيء ليُحذف" : `تأكيد · احذف ${willDeleteTotal} صفّاً`}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {phase === "running" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                {phase === "done" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {phase === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                {phase === "running" && "جارٍ الإخلاء..."}
                {phase === "done" && "أُخليت — القاعدة نظيفة"}
                {phase === "error" && "لم يكتمل"}
              </DialogTitle>
            </DialogHeader>

            {error ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            ) : result ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground text-xs font-semibold">حُذف</div>
                    <div className="mt-2 space-y-1">
                      {Object.entries(result.deleted).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-xs">
                          <code className="font-mono text-[11px]">{k}</code>
                          <span className={v > 0 ? "font-bold" : "text-muted-foreground"}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground text-xs font-semibold">
                      باقٍ كما هو
                    </div>
                    <div className="mt-2 space-y-1">
                      {Object.entries(result.kept).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-xs">
                          <code className="font-mono text-[11px]">{k}</code>
                          <span className="font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* العدّ المُعاد بعد الحذف — هو الدليل، لا ما ادّعى الحذف أنّه حذفه */}
                <div
                  className={`rounded-md border p-3 text-sm ${
                    result.clean
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
                  }`}
                >
                  {result.clean ? (
                    <p className="font-medium">
                      ✅ العدّ بعد الحذف: كل جداول الطلبات صفر · في{" "}
                      {(result.durationMs / 1000).toFixed(1)} ثانية.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-medium">⚠️ بقيت صفوف:</p>
                      <ul className="space-y-0.5 text-xs" dir="ltr">
                        {Object.entries(result.remaining)
                          .filter(([, v]) => v > 0)
                          .map(([k, v]) => (
                            <li key={k} className="text-start font-mono">
                              {k} — {v}
                            </li>
                          ))}
                        {result.failed.map((f) => (
                          <li key={f.name} className="text-start font-mono">
                            {f.name} — {f.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* سجلّ الفواتير قبل محوها. المستند الماليّ لا يُمحى بلا أثر، ومن هذا
                    السجلّ ظهر أن نفس اسم الباقة يحمل مبالغ متباعدة — وهي حقيقة يبنى
                    عليها الترحيل. */}
                {result.invoiceLog.length > 0 && (
                  <details className="rounded-md border p-2">
                    <summary className="cursor-pointer text-xs font-semibold">
                      سجلّ الفواتير قبل المحو ({result.invoiceLog.length})
                    </summary>
                    <div className="mt-2 max-h-56 overflow-y-auto">
                      {result.invoiceLog.map((i) => (
                        <div
                          key={i.number ?? Math.random()}
                          className="flex items-center justify-between gap-2 py-0.5 text-[11px]"
                        >
                          <span className="font-mono">{i.number}</span>
                          <span className="text-muted-foreground truncate">
                            {i.tierName ?? "—"} · {i.client?.name ?? "—"}
                          </span>
                          <span className="font-mono whitespace-nowrap">
                            {i.currency} {i.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                نحذف...
              </div>
            )}

            <DialogFooter>
              {phase === "running" ? (
                <Button disabled>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  جارٍ...
                </Button>
              ) : phase === "done" ? (
                <Button onClick={() => window.location.reload()}>تحديث الصفحة</Button>
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
