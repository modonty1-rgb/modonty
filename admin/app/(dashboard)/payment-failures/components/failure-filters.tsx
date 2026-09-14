import type { PaymentAttemptStage } from "@prisma/client";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { ATTEMPT_STAGES, attemptStageCopy } from "../helpers/attempt-stage-copy";

/**
 * المرشّحات حالةٌ في العنوان (`?stage=` · `?market=` · `?days=`) لا حالة عميل — فالشاشة
 * المرشَّحة تُحفظ في المفضّلة وتُرسل لزميل كما هي. نفس شكل مرشّح الطلبات: روابط، بلا JS.
 */

const MARKETS = [
  { code: "SA", label: "السعودية" },
  { code: "EG", label: "مصر" },
] as const;

const RANGES = [
  { days: 7, label: "٧ أيام" },
  { days: 30, label: "٣٠ يوماً" },
  { days: 90, label: "٩٠ يوماً" },
] as const;

export interface FilterState {
  stage?: PaymentAttemptStage;
  market?: string;
  days: number;
}

/**
 * يبني العنوان من الحالة الحالية مع تبديل مفتاح واحد — فلا يضيع بقيّة المرشّحات عند النقر.
 *
 * و`Omit` قبل التقاطع مقصود: `Partial<FilterState> & { stage?: … | null }` تقاطعٌ يفرض
 * **النوعين معاً**، فـ`null` يرسب أمام `stage?: PaymentAttemptStage`. وزرّ «الكل» يمرّر
 * `null` عمداً ليمحو المرشّح. (كشفه بناء ١٤ سبتمبر ٢٠٢٦.)
 */
function hrefWith(
  state: FilterState,
  patch: Omit<Partial<FilterState>, "stage" | "market"> & { stage?: PaymentAttemptStage | null; market?: string | null },
): string {
  const next = { ...state, ...patch };
  const params = new URLSearchParams();
  if (next.stage) params.set("stage", next.stage);
  if (next.market) params.set("market", next.market);
  if (next.days !== 30) params.set("days", String(next.days));
  const qs = params.toString();
  return qs ? `/payment-failures?${qs}` : "/payment-failures";
}

export function FailureFilters({
  state,
  stageCounts,
  total,
}: {
  state: FilterState;
  stageCounts: Partial<Record<PaymentAttemptStage, number>>;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Row label="المرحلة">
        <Pill href={hrefWith(state, { stage: null })} label="الكل" count={total} isActive={!state.stage} />
        {ATTEMPT_STAGES.map((stage) => {
          const copy = attemptStageCopy(stage);
          return (
            <Pill
              key={stage}
              href={hrefWith(state, { stage })}
              label={copy.label}
              count={stageCounts[stage] ?? 0}
              isActive={state.stage === stage}
              title={copy.hint}
            />
          );
        })}
      </Row>

      <Row label="السوق">
        <Pill href={hrefWith(state, { market: null })} label="الكل" isActive={!state.market} />
        {MARKETS.map((m) => (
          <Pill key={m.code} href={hrefWith(state, { market: m.code })} label={m.label} isActive={state.market === m.code} />
        ))}
      </Row>

      <Row label="المدّة">
        {RANGES.map((r) => (
          <Pill key={r.days} href={hrefWith(state, { days: r.days })} label={r.label} isActive={state.days === r.days} />
        ))}
      </Row>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-14 shrink-0 text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Pill({ href, label, count, isActive, title }: { href: string; label: string; count?: number; isActive: boolean; title?: string }) {
  return (
    <Link
      href={href}
      title={title}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition",
        isActive ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
      {count !== undefined ? (
        <span className={cn("rounded px-1 text-[11px]", isActive ? "bg-background/20" : "bg-muted")}>{count}</span>
      ) : null}
    </Link>
  );
}
