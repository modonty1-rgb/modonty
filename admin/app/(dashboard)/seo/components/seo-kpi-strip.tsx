"use client";

import {
  FileText,
  Database,
  Link2,
  Map,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

/**
 * One strip, one fact per card.
 *
 * This used to be two strips of seven cards — and two of them said the same thing twice:
 * a "JSON-LD · all fresh" health card next to a "Stale JSON-LD · 0" KPI, and the same
 * pairing for canonicals. Repeating a fact does not reinforce it; it makes the reader
 * check whether the two numbers disagree.
 *
 * Each card now owns its subject end to end: the headline is the state, the hint carries
 * the evidence behind it, and the tone is derived from that state rather than set by hand.
 */

type Tone = "neutral" | "ok" | "warn" | "error";

interface Props {
  publishedArticles: number;
  jsonLdCached: number;
  jsonLdStale: number;
  canonicalStale: number;
  sitemapsConfigured: boolean;
  sitemapsStale: number;
}

const TONE_ICON_BG: Record<Tone, string> = {
  neutral: "bg-violet-500/15 text-violet-500",
  ok: "bg-emerald-500/15 text-emerald-500",
  warn: "bg-amber-500/15 text-amber-500",
  error: "bg-red-500/15 text-red-500",
};

const TONE_VALUE: Record<Tone, string> = {
  neutral: "",
  ok: "text-emerald-600 dark:text-emerald-300",
  warn: "text-amber-600 dark:text-amber-300",
  error: "text-red-600 dark:text-red-300",
};

const TONE_BORDER: Record<Tone, string> = {
  neutral: "",
  ok: "",
  warn: "border-amber-500/30 bg-amber-500/5",
  error: "border-red-500/30 bg-red-500/5",
};

function staleTone(stale: number): Tone {
  if (stale === 0) return "ok";
  return stale <= 5 ? "warn" : "error";
}

export function SeoKpiStrip({
  publishedArticles,
  jsonLdCached,
  jsonLdStale,
  canonicalStale,
  sitemapsConfigured,
  sitemapsStale,
}: Props) {
  const coveragePercent =
    publishedArticles > 0 ? Math.round((jsonLdCached / publishedArticles) * 100) : 0;

  // Coverage and freshness are one subject: a card claiming 100% while five entries carry a
  // dead host would be true and useless. The worse of the two decides the tone.
  const coverageTone: Tone =
    coveragePercent >= 95 ? "ok" : coveragePercent >= 80 ? "warn" : "error";
  const jsonLdTone: Tone =
    jsonLdStale > 0 ? staleTone(jsonLdStale) : coverageTone;

  const canonicalTone = staleTone(canonicalStale);
  const sitemapTone: Tone = !sitemapsConfigured
    ? "error"
    : sitemapsStale === 0
      ? "ok"
      : "warn";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        tone="neutral"
        icon={FileText}
        label="Published Articles"
        value={publishedArticles.toLocaleString("en-US")}
        hint="indexable content"
      />
      <KpiCard
        tone={jsonLdTone}
        icon={Database}
        label="JSON-LD"
        value={`${coveragePercent}%`}
        hint={
          jsonLdStale > 0
            ? `${jsonLdCached}/${publishedArticles} cached · ${jsonLdStale} on a stale host`
            : `${jsonLdCached}/${publishedArticles} cached · all hosts fresh`
        }
      />
      <KpiCard
        tone={canonicalTone}
        icon={Link2}
        label="Canonical URLs"
        value={canonicalStale === 0 ? "Clean" : canonicalStale.toLocaleString("en-US")}
        hint={canonicalStale === 0 ? "all 7 tables correct" : "wrong host — across 7 tables"}
      />
      <KpiCard
        tone={sitemapTone}
        icon={Map}
        label="Sitemaps (GSC)"
        value={
          !sitemapsConfigured
            ? "Not set up"
            : sitemapsStale === 0
              ? "Fresh"
              : sitemapsStale.toLocaleString("en-US")
        }
        hint={
          !sitemapsConfigured
            ? "Search Console not connected"
            : sitemapsStale === 0
              ? "submitted within 24h"
              : "older than 24h — resubmitting"
        }
      />
    </div>
  );
}

function KpiCard({
  tone,
  icon: Icon,
  label,
  value,
  hint,
}: {
  tone: Tone;
  icon: typeof FileText;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className={`rounded-xl border bg-card p-3.5 flex items-start gap-3 ${TONE_BORDER[tone]}`}>
      <div
        className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${TONE_ICON_BG[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium truncate">
            {label}
          </div>
          {tone !== "neutral" && <StateIcon tone={tone} />}
        </div>
        <div className={`text-lg font-bold leading-tight mt-0.5 ${TONE_VALUE[tone]}`}>{value}</div>
        <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>
      </div>
    </div>
  );
}

function StateIcon({ tone }: { tone: Tone }) {
  if (tone === "ok")
    return <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />;
  if (tone === "warn")
    return <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />;
  return <XCircle className="h-3 w-3 text-red-500 shrink-0" />;
}
