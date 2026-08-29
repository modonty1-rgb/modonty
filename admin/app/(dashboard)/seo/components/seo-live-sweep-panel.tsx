"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Globe, Laptop } from "lucide-react";

import { runSeoLiveSweep, type SweepResult } from "../actions/seo-live-sweep";

/**
 * فحص السيو الحيّ — زرّ يفتح صفحات الموقع ويعدّ المخالفات.
 *
 * وُجد لأن خالد سأل «كيف أتطمّن بلا ما نستهلك وقت؟» ثم «ليش وظيفة خاصة في الأدمن؟».
 * الجواب هنا: صفٌّ لكل فحص ورقمٌ واحد. صفر = مقفول. غير ذلك = يُفتح ويُقرأ سببه.
 *
 * ولماذا يُعرض النصّ الرسمي عند السقوط فقط: الرقم وحده يقول «انكسر»، ولا يقول «لماذا هذا
 * كسر أصلاً». فحين يسقط الفحص تظهر معه القاعدة التي خالفها — فيُقرأ العطل مع حكمه.
 */
export function SeoLiveSweepPanel() {
  const [busy, setBusy] = useState<"production" | "local" | null>(null);
  const [result, setResult] = useState<SweepResult | null>(null);
  const [ranAt, setRanAt] = useState<string | null>(null);

  async function run(target: "production" | "local") {
    setBusy(target);
    try {
      const r = await runSeoLiveSweep(target);
      setResult(r);
      setRanAt(new Date().toLocaleString("ar-SA", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "long" }));
    } catch (error) {
      setResult({
        ok: false, baseUrl: "", pagesChecked: 0, checks: [], details: [], broken: [],
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setBusy(null);
    }
  }

  const failed = result?.checks.filter((c) => c.count > 0) ?? [];

  return (
    <section className="rounded-xl border bg-card p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">🔍 فحص السيو الحيّ</h2>
          <p className="text-xs text-muted-foreground">
            يفتح صفحات الموقع ويعدّ المخالفات. صفرٌ في كل سطر = لم ينكسر شيء. قراءة فقط.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => run("production")} disabled={busy !== null}>
            {busy === "production" ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
            افحص الإنتاج
          </Button>
          <Button size="sm" variant="outline" onClick={() => run("local")} disabled={busy !== null}>
            {busy === "local" ? <Loader2 className="size-4 animate-spin" /> : <Laptop className="size-4" />}
            افحص المحلي
          </Button>
        </div>
      </header>

      {busy && (
        <p className="mt-4 text-sm text-muted-foreground">
          جارٍ فحص ١٤ صفحة… قد يستغرق دقيقة.
        </p>
      )}

      {result?.error && (
        <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {result.error}
        </p>
      )}

      {result && !result.error && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground" dir="ltr">
            {result.baseUrl} · {result.pagesChecked} صفحة{ranAt ? ` · ${ranAt}` : ""}
          </p>

          <ul className="divide-y rounded-lg border text-sm">
            {result.checks.map((c) => {
              const ok = c.count === 0;
              return (
                <li key={c.key} className="px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      {ok
                        ? <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden />
                        : <XCircle className="size-4 shrink-0 text-destructive" aria-hidden />}
                      {c.label}
                    </span>
                    <span className={ok ? "text-muted-foreground" : "font-semibold text-destructive"} dir="ltr">
                      {c.outOf !== undefined ? `${c.count} / ${c.outOf}` : c.count}
                    </span>
                  </div>
                  {!ok && <p className="mt-1 ps-6 text-xs text-muted-foreground">↳ {c.source}</p>}
                </li>
              );
            })}
          </ul>

          {result.broken.length > 0 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <b>صفحات لم ترجع 200:</b>
              <ul className="mt-1 space-y-0.5 text-xs">
                {result.broken.map((b) => <li key={b} dir="ltr">{b}</li>)}
              </ul>
            </div>
          )}

          {failed.length > 0 && result.details.length > 0 && (
            <details className="rounded-lg border p-3 text-sm">
              <summary className="cursor-pointer font-medium">التفاصيل — أين بالضبط ({result.details.length})</summary>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {result.details.map((d, i) => <li key={i}>• {d}</li>)}
              </ul>
            </details>
          )}

          <p className={`text-sm font-semibold ${result.ok ? "text-emerald-600" : "text-destructive"}`}>
            {result.ok
              ? "✅ كل الفحوص صفر — لم ينكسر شيء."
              : `⚠️ ${failed.length} فحصاً بغير صفر${result.broken.length ? ` · ${result.broken.length} صفحة لم ترجع 200` : ""}.`}
          </p>
        </div>
      )}
    </section>
  );
}
