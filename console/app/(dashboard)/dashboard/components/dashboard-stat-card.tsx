import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type StatTone = "primary" | "emerald" | "amber" | "violet" | "red" | "muted";

export interface StatTrend {
  value: number; // percentage (positive = up, negative = down)
  label: string; // "مقارنة بالأسبوع السابق"
  inverted?: boolean; // true means lower-is-better (e.g., bounce rate)
}

export interface StatBadge {
  label: string;
  tone: "emerald" | "amber" | "red" | "muted";
}

interface DashboardStatCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  value: React.ReactNode;
  hint?: string;
  tone?: StatTone;
  trend?: StatTrend;
  badge?: StatBadge;
}

const TONE_CLASSES: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary ring-primary/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  muted: "bg-muted text-muted-foreground ring-border",
};

const BADGE_CLASSES: Record<StatBadge["tone"], string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  muted: "bg-muted text-muted-foreground",
};

export function DashboardStatCard({
  icon: Icon,
  title,
  value,
  hint,
  tone = "primary",
  trend,
  badge,
}: DashboardStatCardProps) {
  const trendDir =
    trend === undefined
      ? null
      : trend.value === 0
        ? "flat"
        : trend.value > 0
          ? "up"
          : "down";

  // For inverted metrics (e.g., bounce rate), DOWN is good and UP is bad.
  const trendIsGood =
    trendDir === null
      ? null
      : trend!.inverted
        ? trendDir === "down"
        : trendDir === "up";

  const trendColorClass =
    trendDir === null
      ? ""
      : trendDir === "flat"
        ? "text-muted-foreground"
        : trendIsGood
          ? "text-emerald-700"
          : "text-red-700";

  const TrendIcon =
    trendDir === "up"
      ? TrendingUp
      : trendDir === "down"
        ? TrendingDown
        : Minus;

  return (
    <Card className="h-full shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1 ${TONE_CLASSES[tone]}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <p className="truncate text-xs font-medium text-muted-foreground">
              {title}
            </p>
          </div>
          {badge && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${BADGE_CLASSES[badge.tone]}`}
            >
              {badge.label}
            </span>
          )}
        </div>

        <p className="text-2xl font-bold leading-tight tabular-nums text-foreground">
          {value}
        </p>

        {hint && (
          <p className="text-[11px] leading-snug text-muted-foreground line-clamp-2">
            {hint}
          </p>
        )}

        {trend && (
          <div className="mt-auto flex items-center gap-1.5 pt-1 text-[11px]">
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${trendColorClass}`}
            >
              <TrendIcon className="h-3 w-3" />
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="truncate text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
