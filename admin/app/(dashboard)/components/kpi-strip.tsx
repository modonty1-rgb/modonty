import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import type { ReactNode } from "react";

export type KpiAccent = "blue" | "cyan" | "emerald" | "amber" | "violet" | "neutral";

export interface KpiItem {
  label: string;
  value: ReactNode;
  /** Tiny secondary line (e.g. "14 mobile · 33 desktop"). */
  caption?: string;
  /** Comparison vs previous period. `positive` controls the color (not the sign). */
  delta?: { value: number; positive: boolean; suffix?: string };
  /** Raw sparkline numbers; rendered as inline SVG polyline. */
  sparkline?: number[];
  /** Render a progress bar instead of sparkline (0–100). */
  progress?: number;
  /** Optional drill-down link for the whole card. */
  href?: string;
  /** Visual accent — defaults to the section's accent if used inside KpiStripGroup. */
  accent?: KpiAccent;
  /** Show a pulsing "live" dot in the corner. */
  live?: boolean;
}

interface KpiStripProps {
  items: KpiItem[];
  /** Default accent applied to items without an explicit one. */
  defaultAccent?: KpiAccent;
}

const ACCENT_VALUE: Record<KpiAccent, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  violet: "text-violet-600 dark:text-violet-400",
  neutral: "text-foreground",
};

const ACCENT_STROKE: Record<KpiAccent, string> = {
  blue: "stroke-blue-500",
  cyan: "stroke-cyan-500",
  emerald: "stroke-emerald-500",
  amber: "stroke-amber-500",
  violet: "stroke-violet-500",
  neutral: "stroke-muted-foreground",
};

const ACCENT_PROGRESS: Record<KpiAccent, string> = {
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  neutral: "bg-foreground",
};

function Sparkline({ data, accent }: { data: number[]; accent: KpiAccent }) {
  if (data.length < 2) return <div className="h-10" />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 28 - ((v - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="h-10 w-full mt-2" viewBox="0 0 100 30" preserveAspectRatio="none">
      <polyline
        points={points}
        className={ACCENT_STROKE[accent]}
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function DeltaPill({ delta }: { delta: NonNullable<KpiItem["delta"]> }) {
  const { value, positive, suffix = "%" } = delta;
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground">
        <Minus className="h-3 w-3" /> 0{suffix}
      </span>
    );
  }
  const sign = value > 0 ? "+" : "";
  const color = positive ? "text-emerald-500" : "text-red-500";
  const Arrow = value > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${color}`}>
      <Arrow className="h-3 w-3" />
      {sign}
      {value}
      {suffix}
    </span>
  );
}

function KpiCard({ item, fallbackAccent }: { item: KpiItem; fallbackAccent: KpiAccent }) {
  const accent = item.accent ?? fallbackAccent;

  const card = (
    <div className="group p-4 rounded-lg border bg-card hover:border-foreground/20 transition-all hover:-translate-y-0.5 h-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-muted-foreground font-medium truncate">{item.label}</span>
        {item.live ? (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        ) : item.delta ? (
          <DeltaPill delta={item.delta} />
        ) : null}
      </div>

      <div className={`text-2xl font-extrabold tabular-nums leading-none ${ACCENT_VALUE[accent]}`}>
        {item.value}
      </div>

      {item.caption && (
        <p className="text-[10px] text-muted-foreground mt-2 truncate">{item.caption}</p>
      )}

      {item.sparkline && <Sparkline data={item.sparkline} accent={accent} />}

      {typeof item.progress === "number" && (
        <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${ACCENT_PROGRESS[accent]}`}
            style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
          />
        </div>
      )}
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block">
        {card}
      </Link>
    );
  }
  return card;
}

export function KpiStrip({ items, defaultAccent = "neutral" }: KpiStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 border-b">
      {items.map((item, i) => (
        <KpiCard key={`${item.label}-${i}`} item={item} fallbackAccent={defaultAccent} />
      ))}
    </div>
  );
}
