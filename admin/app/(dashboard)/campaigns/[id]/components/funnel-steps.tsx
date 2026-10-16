import { cn } from "@/lib/utils";

const ar = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });
const ar1 = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 });

/** `cost` overrides «الواحد بـ…» — impressions are priced per thousand, not each. */
export type FunnelStep = { label: string; n: number | null; note?: string; cost?: string };
export type FunnelStage = { title: string; source: string; tone: "sky" | "emerald" | "violet"; steps: FunnelStep[]; footer?: React.ReactNode };

const TONE = {
  sky: { dot: "bg-sky-500", bar: "bg-sky-500/70" },
  emerald: { dot: "bg-emerald-500", bar: "bg-emerald-500/70" },
  violet: { dot: "bg-violet-500", bar: "bg-violet-500/70" },
} as const;

/**
 * القمع في ثلاث مراحل جنب بعض — الإعلان (ميتا) ← صفحة الهبوط (قاعدتنا) ← المبيعات — بدل عشرة أسطر
 * فوق بعض (خالد ١٦ أكتوبر ٢٠٢٦: «تايه»). كل خطوة: العدد، ونسبتها من اللي قبلها (حتى عبر المراحل)،
 * وتكلفتها من الصرف. `null` = المصدر ما ردّ — «—» لا صفر.
 */
export function FunnelSteps({ stages, spend, money }: { stages: FunnelStage[]; spend: number | null; money: (n: number) => string }) {
  let prev: number | null = null;
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {stages.map((stage) => (
        <section key={stage.title} className="rounded-lg border bg-card">
          <h3 className="flex items-center gap-2 border-b px-3 py-2 text-sm font-semibold">
            <span className={cn("size-2 rounded-full", TONE[stage.tone].dot)} aria-hidden />
            {stage.title}
            <span className="ms-auto text-[11px] font-normal text-muted-foreground">{stage.source}</span>
          </h3>
          <ol className="divide-y">
            {stage.steps.map((s) => {
              const rate = s.n != null && prev ? (s.n / prev) * 100 : null;
              prev = s.n ?? prev;
              return (
                <li key={s.label} className="space-y-1 px-3 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm">{s.label}</span>
                    <b className="ms-auto text-lg tabular-nums leading-none">{s.n == null ? "—" : ar.format(s.n)}</b>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div className={cn("h-full rounded-full", TONE[stage.tone].bar)} style={{ width: `${rate == null ? (s.n ? 100 : 0) : Math.max(2, Math.min(100, rate))}%` }} />
                  </div>
                  <p className="flex gap-3 text-[11px] text-muted-foreground">
                    {rate != null ? <span>{ar1.format(rate)}٪ من اللي قبلها</span> : null}
                    {s.cost ? <span className="ms-auto">{s.cost}</span> : spend && s.n ? <span className="ms-auto">الواحد بـ {money(spend / s.n)}</span> : null}
                  </p>
                  {s.note ? <p className="text-[11px] text-muted-foreground">{s.note}</p> : null}
                </li>
              );
            })}
          </ol>
          {stage.footer ? <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">{stage.footer}</div> : null}
        </section>
      ))}
    </div>
  );
}
