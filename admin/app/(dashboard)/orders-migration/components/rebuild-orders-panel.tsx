"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RebuildPlan } from "../helpers/plan-rebuild";

type RunResult = {
  clean: boolean;
  created: number;
  durationMs: number;
  failed: { clientName: string; error: string }[];
  verify: { orders: number; ordersLinked: number; clientsPointing: number; clients: number };
};

const money = (minor: number, currency: string | null) =>
  `${(minor / 100).toLocaleString("en-US")} ${currency ?? ""}`.trim();

/**
 * **الصفحةُ تعرض التفاصيل كاملةً — وهي صفحةٌ لا نافذة.**
 *
 * أُسقطت التفاصيل حين كانت حواراً ضيّقاً، ثمّ أُعيدت حين صارت صفحةً مستقلّة (خالد
 * ١٨ سبتمبر ٢٠٢٦: «طالما أنّها صفحةٌ مستقلّةٌ بذاتها، تقدّم لك تفاصيل كاملة»). والفرقُ
 * ليس في المساحة: الحوارُ يُفتح فوق عملٍ آخر فيُقرأ بطرف العين، والصفحةُ هي العمل.
 *
 * **والتقدّمُ مقيسٌ لا مُوهَم:** المسارُ يبثّ سطراً بعد كلّ عميل (NDJSON)، فالشريطُ
 * يتحرّك بما وصل فعلاً ويُذكر اسمُ العميل الجاري. وشريطٌ يدور بلا رقمٍ يجعل المعلَّقَ
 * يبدو كالعامل.
 */
export function RebuildOrdersPanel({ plan }: { plan: RebuildPlan }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "running" | "done" | "error">("idle");
  const [progress, setProgress] = useState<{ done: number; total: number; name: string } | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  async function run() {
    setPhase("running");
    setError(null);
    setResult(null);
    setProgress({ done: 0, total: plan.clients, name: "نحسب الخطّة..." });
    try {
      const res = await fetch("/api/dev/rebuild-orders", { method: "POST" });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setError(err.error ?? `HTTP ${res.status}`);
        setPhase("error");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // سطرٌ كاملٌ فقط يُفكّ — الشبكةُ تقطع الرسائل في أيّ موضع.
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const msg = JSON.parse(line) as Record<string, unknown>;
          if (msg.type === "phase") {
            const p = msg.phase as string;
            setProgress({
              done: 0,
              total: plan.clients,
              // المراحلُ التي يبثّها المسار: plan · skip · build. ولا مرحلةَ مسحٍ بعد اليوم.
              name: p === "plan" ? "نحسب الخطّة..." : p === "skip" ? "نتخطّى مَن له طلب..." : "نبني الطلبات...",
            });
          } else if (msg.type === "progress") {
            setProgress({ done: msg.done as number, total: msg.total as number, name: msg.name as string });
          } else if (msg.type === "result") {
            const r = msg as unknown as RunResult;
            setResult(r);
            setPhase(r.clean ? "done" : "error");
          } else if (msg.type === "fatal") {
            setError(msg.error as string);
            setPhase("error");
          }
        }
      }
      // الصفحةُ تُعيد قراءة الحارس، فتقول «تمّ» وتُخفي الزرَّ على الإنتاج من تلقائها.
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر الاتّصال");
      setPhase("error");
    }
  }

  const pct = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat value={plan.toBuild} label="عميلاً سيُصنع له طلب" tone="primary" />
        <Stat value={plan.clean} label="طلبٌ كامل" tone="emerald" />
        <Stat value={plan.needsReview} label="يحتاج مراجعة" tone="amber" />
      </div>

      <div className="rounded-lg border p-3">
        <p className="text-xs font-semibold text-muted-foreground">المبالغ — لا تُجمع عبر العملات</p>
        <div className="mt-1.5 flex flex-wrap gap-4 text-sm">
          {plan.byCurrency.map((c) => (
            <span key={c.currency}>
              <code className="font-mono text-xs">{c.currency}</code>{" "}
              <span className="text-muted-foreground">{c.count} عميلاً =</span>{" "}
              <b className="tabular-nums">{(c.totalMinor / 100).toLocaleString("en-US")}</b>
            </span>
          ))}
          <span className="text-muted-foreground">
            يبقى كما هو: <b className="tabular-nums">{plan.existing.orders}</b> طلباً و
            <b className="tabular-nums"> {plan.existing.invoices}</b> فاتورة
          </span>
        </div>
      </div>

      {plan.gapGroups.length > 0 && (
        <div className="rounded-lg border border-amber-500/30">
          <p className="border-b bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
            المشاكل التي ستُوسَم «يحتاج مراجعة» — {plan.gapGroups.length} نوعاً
          </p>
          <ul className="divide-y">
            {plan.gapGroups.map((g) => (
              <li key={g.gap}>
                <button
                  type="button"
                  onClick={() => setOpen(open === g.gap ? null : g.gap)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-accent"
                  aria-expanded={open === g.gap}
                >
                  <ChevronDown
                    className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${
                      open === g.gap ? "" : "rotate-90"
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{g.gap}</span>
                  <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] tabular-nums text-amber-700 dark:text-amber-400">
                    {g.clients.length}
                  </span>
                </button>
                {open === g.gap && (
                  <ul className="max-h-64 overflow-y-auto border-t bg-muted/30 px-3 py-1.5">
                    {g.clients.map((c) => (
                      <li key={c.name} className="flex items-center justify-between gap-3 py-1 text-xs">
                        <span className="truncate">{c.name}</span>
                        <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                          {money(c.totalMinor, c.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/**
        * الزرُّ لم يعد مدمّراً (١٩ سبتمبر ٢٠٢٦): الترحيلُ صار إضافيّاً — لا يمسح طلباً ولا
        * فاتورة، ويتخطّى كلَّ عميلٍ له طلبٌ بالفعل. فسقط عنه `variant="destructive"` ولفظُ
        * «امسح»: زرٌّ أحمرُ يقول «امسح» وهو لا يمسح يُعلّم الموظّفَ ألّا يصدّق التحذيرات.
        */}
      {plan.toBuild === 0 ? (
        /**
          * لا شيءَ يُبنى — فلا زرَّ يُضغط. وهذا نفسُ ما تقوله لوحةُ الوثائق حين تنتهي،
          * وبه لا يبقى زرٌّ يعد بـ«٤٢ عميلاً» ثمّ يبني صفراً بعد أوّل تشغيلٍ ناجح.
          */
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          لا شيءَ يُبنى — <b className="tabular-nums">{plan.alreadyHave}</b> عميلاً لهم طلبٌ بالفعل.
          وما احتاج تصحيحاً يُصحَّح من صفحة الطلب نفسِه.
        </p>
      ) : (
        <Button onClick={run} disabled={phase === "running"} className="w-full sm:w-auto">
          {phase === "running" && <Loader2 className="me-2 size-4 animate-spin" aria-hidden />}
          {phase === "running" ? "جارٍ..." : `ابنِ الطلبات الناقصة (${plan.toBuild} عميلاً)`}
        </Button>
      )}

      {phase === "running" && progress && (
        <div className="space-y-1.5" role="status" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${pct}%` }} />
          </div>
          <p className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="truncate">{progress.name}</span>
            <span className="shrink-0 tabular-nums">
              {progress.done} / {progress.total} · {pct}%
            </span>
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div
          className={`flex items-start gap-2.5 rounded-md border p-3 text-sm ${
            result.clean
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
          }`}
        >
          {result.clean ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          )}
          <div className="space-y-1">
            {/* العدُّ المُعاد هو الدليل — لا رسالةُ نجاحٍ نكتبها نحن. */}
            <p className="tabular-nums">
              {result.verify.orders} طلباً · {result.verify.ordersLinked} مربوطاً بعميل ·{" "}
              {result.verify.clientsPointing} من {result.verify.clients} عميلاً يشير لطلبه ·{" "}
              {(result.durationMs / 1000).toFixed(1)} ثانية
            </p>
            {result.failed.length > 0 && (
              <ul className="space-y-0.5 text-xs">
                {result.failed.map((f) => (
                  <li key={f.clientName}>
                    {f.clientName} — {f.error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone: "primary" | "emerald" | "amber" }) {
  const cls =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "emerald"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return (
    <div className={`rounded-lg p-3 text-center ${cls}`}>
      <div className="text-2xl font-bold tabular-nums leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
