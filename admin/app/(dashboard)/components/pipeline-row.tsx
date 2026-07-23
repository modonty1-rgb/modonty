import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { IBOX, type Tier } from "./dashboard-ui";

/**
 * The dashboard's one row language, shared by Articles and Clients (Khalid 2026-07-23:
 * «نحول كله نفس فكرة الجدول»). Two shapes:
 *
 *   PipelineRow — a thin ranked-strip row for a single number (colour rail · icon box ·
 *     big number · label+note · action). What every card used to be.
 *   BudgetRow   — one row for a whole PARTITION: a headline total + a segmented bar whose
 *     widths are each part's share + per-part counts, each drilling in. Only honest when
 *     the parts sum to the total (article stages; client CTA modes) — never for
 *     overlapping flags, where a stacked bar would lie.
 */

export const RAIL: Record<Tier, string> = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
  ok: "bg-emerald-500",
  plain: "bg-muted-foreground/40",
};
export const NUM: Record<Tier, string> = {
  hot: "text-red-600 dark:text-red-400",
  warm: "text-amber-600 dark:text-amber-400",
  ok: "text-emerald-600 dark:text-emerald-400",
  plain: "text-muted-foreground",
};

export function PipelineRow({
  href,
  tier,
  icon: Icon,
  value,
  label,
  note,
  action,
}: {
  href: string;
  tier: Tier;
  icon: LucideIcon;
  value: number | string;
  label: string;
  note?: string;
  action?: string;
}) {
  return (
    <Link
      href={href}
      className="relative grid grid-cols-[2.25rem_4.5rem_1fr] items-center gap-3 border-b px-4 py-2.5 transition last:border-b-0 hover:bg-muted/40 md:grid-cols-[2.25rem_4.5rem_1fr_auto]"
    >
      <span className={`absolute inset-y-0 start-0 w-0.5 ${RAIL[tier]}`} />
      <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg ${IBOX[tier]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className={`text-xl font-extrabold leading-none tabular-nums ${NUM[tier]}`}>
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </span>
      <span className="text-[13px] leading-snug">
        {label}
        {note && <span className="mt-0.5 block text-[11px] text-muted-foreground">{note}</span>}
      </span>
      {action && (
        <span className="hidden text-[11.5px] font-bold text-primary md:block">{action} →</span>
      )}
    </Link>
  );
}

export interface BudgetSegment {
  key: string;
  href: string;
  label: string;
  value: number;
  tier: Tier;
}

export function BudgetRow({
  total,
  label,
  icon: Icon,
  reviewHref,
  reviewLabel = "review",
  segments,
}: {
  total: number;
  label: string;
  icon: LucideIcon;
  reviewHref: string;
  reviewLabel?: string;
  segments: BudgetSegment[];
}) {
  const live = segments.filter((s) => s.value > 0);
  return (
    <div className="border-b px-4 py-2.5 last:border-b-0">
      {/* Line 1: icon · total · label · the segmented bar (fills the middle) · review. */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="shrink-0 text-lg font-extrabold leading-none tabular-nums">
          {total.toLocaleString("en-US")}
        </span>
        <span className="shrink-0 text-[12px] font-semibold text-muted-foreground">{label}</span>
        <div className="flex h-2 min-w-[48px] flex-1 overflow-hidden rounded-full bg-muted">
          {live.map((s) => (
            <Link
              key={s.key}
              href={s.href}
              style={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%` }}
              className={`${RAIL[s.tier]} transition hover:opacity-80`}
              title={`${s.label}: ${s.value}`}
              aria-label={`${s.label}: ${s.value}`}
            />
          ))}
        </div>
        <Link
          href={reviewHref}
          className="shrink-0 text-[11.5px] font-bold text-primary hover:underline"
        >
          {reviewLabel} →
        </Link>
      </div>
      {/* Line 2: per-part counts, tight. */}
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
        {live.map((s) => (
          <Link key={s.key} href={s.href} className="inline-flex items-center gap-1 hover:underline">
            <span className={`h-1.5 w-1.5 rounded-full ${RAIL[s.tier]}`} />
            <span className={`text-[12px] font-extrabold tabular-nums ${NUM[s.tier]}`}>
              {s.value.toLocaleString("en-US")}
            </span>
            <span className="text-[11px] text-muted-foreground">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
