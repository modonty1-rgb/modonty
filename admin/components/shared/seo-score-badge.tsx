import Link from "next/link";

import { cn } from "@/lib/utils";
import { GoogleIcon } from "@/components/admin/icons/google-icon";

// The ONE SEO-score chip used everywhere (SEO Client / SEO Images / media grid + segment /
// any score table). The Google "G" marks it as a search/SEO score; only the background + text
// follow the tier. One threshold, one shape — change it here, it changes everywhere.
//
// Tiers (locked with Khalid 2026-07-21): ≥90 green · 50–89 amber · <50 red.

export type SeoScoreSize = "sm" | "md" | "lg";

interface SeoScoreBadgeProps {
  score: number;
  size?: SeoScoreSize;
  /** Show the Google "G" before the number (default true). */
  showIcon?: boolean;
  /** Append a word (سليم / متوسط / ناقص) after the percentage. */
  label?: boolean;
  /** When set, the badge renders as a clickable Link. */
  href?: string;
  /** When set (and no href), the badge renders as a clickable button. */
  onClick?: () => void;
  className?: string;
}

type Tier = "green" | "amber" | "red";

function tierOf(score: number): Tier {
  if (score >= 90) return "green";
  if (score >= 50) return "amber";
  return "red";
}

const TIER_CLS: Record<Tier, string> = {
  green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-500 border-amber-500/25",
  red: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25",
};

const TIER_WORD: Record<Tier, string> = { green: "سليم", amber: "متوسط", red: "ناقص" };

const SIZE_CLS: Record<SeoScoreSize, string> = {
  sm: "text-[11px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-1.5",
};

const ICON_CLS: Record<SeoScoreSize, string> = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function SeoScoreBadge({
  score,
  size = "md",
  showIcon = true,
  label = false,
  href,
  onClick,
  className,
}: SeoScoreBadgeProps) {
  const tier = tierOf(score);
  const clickable = Boolean(href || onClick);
  const cls = cn(
    "inline-flex items-center rounded-full border font-extrabold leading-none whitespace-nowrap align-middle",
    SIZE_CLS[size],
    TIER_CLS[tier],
    clickable && "transition hover:ring-2 hover:ring-primary/30",
    className,
  );

  const content = (
    <>
      {showIcon && <GoogleIcon className={cn("shrink-0", ICON_CLS[size])} />}
      <span>
        {Math.round(score)}%{label ? ` · ${TIER_WORD[tier]}` : ""}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls} title="اعرض تفاصيل السيو">
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} title="اعرض تفاصيل السيو">
        {content}
      </button>
    );
  }
  return <span className={cls}>{content}</span>;
}
