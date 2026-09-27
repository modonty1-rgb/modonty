"use client";

import { cn } from "@/lib/utils";

/**
 * Admin KPI card — a horizontal row: tinted icon square, number, label beside it.
 * Entity-standard #4 — the single source of truth; reuse it, never rebuild it.
 *
 * Lifted here from `clients/accounts` when `sales-leads` became its second consumer,
 * exactly as the standard prescribes («أعد استخدامه؛ إن لزم كيان آخر ارفعه لمكوّن مشترك
 * بدل النسخ»). The accounts screen imports it from here now, so the shape is defined once.
 *
 * The card IS the filter: one definition drives both the number printed here and the rows
 * the table shows, so the count can never contradict what a click reveals.
 */
export interface KpiMeta {
  /** Tinted square behind the icon — semantic per entity-standard #3. */
  tone: string;
  /** Ring colour when this card is the active filter. */
  ring: string;
  label: string;
}

export function KpiToggle({
  meta,
  value,
  active,
  onClick,
  icon: Icon,
  disabled = false,
  trailing,
  variant = "row",
}: {
  meta: KpiMeta;
  /** Pre-formatted so Arabic screens can pass Arabic-Indic digits. */
  value: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  /** A count of zero filters to an empty table — a dead end, so the card stops being pressable. */
  disabled?: boolean;
  /** Rendered beside the toggle, never inside it — a button cannot nest a button. */
  trailing?: React.ReactNode;
  /**
   * `row` (default) — the compact strip every entity screen uses. `tile` — a large square for
   * a header that gives the numbers their own panel (Client Quotas, 27 Sep 2026): same data,
   * same filter behaviour, only the drawing changes.
   */
  variant?: "row" | "tile";
}) {
  if (variant === "tile") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={active}
        title={disabled ? meta.label : `${meta.label} — اضغط للتصفية`}
        className={cn(
          // A big number, not a tall card: the tile is as short as a filter row pair, so the
          // header does not grow for it (Khalid: «تستغل المساحة… مش نهدر»).
          "flex items-center gap-2.5 rounded-lg border bg-card px-3 py-1.5 text-start transition-all",
          active && `ring-2 ${meta.ring} border-transparent`,
          disabled ? "cursor-default opacity-60" : "hover:bg-accent/40 active:scale-[0.99]",
        )}
      >
        {/* One line: icon · number · description (Khalid, 27 Sep 2026). */}
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", meta.tone)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xl font-bold leading-none tabular-nums">{value}</span>
        <span className="min-w-0 truncate text-sm text-muted-foreground" dir="auto">{meta.label}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card px-2.5 py-2 transition-all",
        active && `ring-2 ${meta.ring} border-transparent`,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={active}
        title={disabled ? meta.label : `${meta.label} — اضغط للتصفية`}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 text-start transition-transform",
          disabled ? "cursor-default" : "active:scale-[0.98]",
        )}
      >
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded", meta.tone)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-base font-bold leading-none tabular-nums">{value}</span>
        <span className="truncate text-[11px] leading-tight text-muted-foreground">{meta.label}</span>
      </button>
      {trailing}
    </div>
  );
}
