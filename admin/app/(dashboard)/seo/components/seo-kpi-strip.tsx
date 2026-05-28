"use client";

import { FileText, Database, AlertTriangle, Link2 } from "lucide-react";

interface Props {
  publishedArticles: number;
  jsonLdCached: number;
  jsonLdStale: number;
  canonicalStale: number;
}

type Tone = "violet" | "emerald" | "amber" | "red" | "blue";

const TONE_BG: Record<Tone, string> = {
  violet: "bg-violet-500/15 text-violet-500",
  emerald: "bg-emerald-500/15 text-emerald-500",
  amber: "bg-amber-500/15 text-amber-500",
  red: "bg-red-500/15 text-red-500",
  blue: "bg-blue-500/15 text-blue-500",
};

export function SeoKpiStrip({
  publishedArticles,
  jsonLdCached,
  jsonLdStale,
  canonicalStale,
}: Props) {
  const coveragePercent =
    publishedArticles > 0 ? Math.round((jsonLdCached / publishedArticles) * 100) : 0;
  const coverageTone: Tone =
    coveragePercent >= 95 ? "emerald" : coveragePercent >= 80 ? "amber" : "red";
  const staleTone: Tone = jsonLdStale === 0 ? "emerald" : jsonLdStale <= 5 ? "amber" : "red";
  const canonicalTone: Tone = canonicalStale === 0 ? "emerald" : canonicalStale <= 5 ? "amber" : "red";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        tone="violet"
        icon={FileText}
        label="Published Articles"
        value={publishedArticles.toLocaleString()}
        hint="indexable content"
      />
      <KpiCard
        tone={coverageTone}
        icon={Database}
        label="JSON-LD Coverage"
        value={`${coveragePercent}%`}
        hint={`${jsonLdCached}/${publishedArticles} cached`}
      />
      <KpiCard
        tone={staleTone}
        icon={AlertTriangle}
        label="Stale JSON-LD"
        value={jsonLdStale.toLocaleString()}
        hint={jsonLdStale === 0 ? "all hosts fresh" : "needs regeneration"}
      />
      <KpiCard
        tone={canonicalTone}
        icon={Link2}
        label="Stale Canonicals"
        value={canonicalStale.toLocaleString()}
        hint={canonicalStale === 0 ? "all URLs clean" : "needs sanitize"}
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
    <div className="rounded-xl border bg-card p-3.5 flex items-start gap-3">
      <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${TONE_BG[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </div>
        <div className="text-lg font-bold leading-tight mt-0.5">{value}</div>
        <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>
      </div>
    </div>
  );
}
