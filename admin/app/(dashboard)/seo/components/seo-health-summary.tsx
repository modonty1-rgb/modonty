"use client";

import { CheckCircle2, AlertTriangle, XCircle, Globe, Map, Link2 } from "lucide-react";

type Tone = "ok" | "warn" | "error";

interface Indicator {
  key: string;
  label: string;
  detail: string;
  tone: Tone;
  icon: typeof Globe;
}

interface Props {
  jsonLdStale: number;
  canonicalStale: number;
  sitemapsConfigured: boolean;
  sitemapsStale: number;
}

function jsonLdTone(stale: number): Tone {
  if (stale === 0) return "ok";
  if (stale <= 5) return "warn";
  return "error";
}

function sitemapTone(configured: boolean, stale: number): Tone {
  if (!configured) return "error";
  return stale === 0 ? "ok" : "warn";
}

const TONE_STYLES: Record<Tone, { border: string; bg: string; iconBg: string; text: string }> = {
  ok: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    iconBg: "bg-emerald-500/15 text-emerald-500",
    text: "text-emerald-600 dark:text-emerald-300",
  },
  warn: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    iconBg: "bg-amber-500/15 text-amber-500",
    text: "text-amber-600 dark:text-amber-300",
  },
  error: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    iconBg: "bg-red-500/15 text-red-500",
    text: "text-red-600 dark:text-red-300",
  },
};

function StatusIcon({ tone }: { tone: Tone }) {
  if (tone === "ok") return <CheckCircle2 className="h-4 w-4" />;
  if (tone === "warn") return <AlertTriangle className="h-4 w-4" />;
  return <XCircle className="h-4 w-4" />;
}

export function SeoHealthSummary({
  jsonLdStale,
  canonicalStale,
  sitemapsConfigured,
  sitemapsStale,
}: Props) {
  const indicators: Indicator[] = [
    {
      key: "jsonld",
      label: "JSON-LD",
      detail: jsonLdStale === 0 ? "all fresh" : `${jsonLdStale} stale`,
      tone: jsonLdTone(jsonLdStale),
      icon: Globe,
    },
    {
      key: "canonical",
      label: "Canonical URLs",
      detail: canonicalStale === 0 ? "all clean" : `${canonicalStale} stale`,
      tone: jsonLdTone(canonicalStale),
      icon: Link2,
    },
    {
      key: "sitemap",
      label: "Sitemaps (GSC)",
      detail: !sitemapsConfigured
        ? "GSC not configured"
        : sitemapsStale === 0
          ? "fresh < 24h"
          : `${sitemapsStale} stale`,
      tone: sitemapTone(sitemapsConfigured, sitemapsStale),
      icon: Map,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {indicators.map((ind) => {
        const styles = TONE_STYLES[ind.tone];
        const Icon = ind.icon;
        return (
          <div
            key={ind.key}
            className={`rounded-xl border p-3.5 flex items-center gap-3 ${styles.border} ${styles.bg}`}
          >
            <div
              className={`size-9 rounded-lg flex items-center justify-center ${styles.iconBg}`}
            >
              <StatusIcon tone={ind.tone} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-muted-foreground" />
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  {ind.label}
                </div>
              </div>
              <div className={`text-sm font-semibold mt-0.5 ${styles.text}`}>{ind.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
