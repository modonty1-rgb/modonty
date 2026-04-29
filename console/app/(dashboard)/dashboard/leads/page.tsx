import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ar } from "@/lib/ar";
import {
  getLeads,
  getLeadStats,
  getLeadsLastRefreshedAt,
  type LeadStats,
} from "./helpers/lead-queries";
import { LeadsTable } from "./components/leads-table";
import { RefreshLeadScoresButton } from "./components/refresh-lead-scores-button";
import { KpiInfoCard } from "./components/kpi-info-card";
import { Clock } from "lucide-react";

export const dynamic = "force-dynamic";

function timeAgoArabic(d: Date | null): string {
  if (!d) return ar.leads.never;
  const ar_ = ar.leads;
  const diffMs = Date.now() - new Date(d).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return ar_.refreshedJustNow;
  if (min < 60) return ar_.refreshedMinutesAgo.replace("{n}", String(min));
  const hr = Math.floor(min / 60);
  if (hr < 24) return ar_.refreshedHoursAgo.replace("{n}", String(hr));
  const day = Math.floor(hr / 24);
  return ar_.refreshedDaysAgo.replace("{n}", String(day));
}

export default async function LeadsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [leads, stats, lastRefreshedAt] = await Promise.all([
    getLeads(clientId),
    getLeadStats(clientId),
    getLeadsLastRefreshedAt(clientId),
  ]);

  const l = ar.leads;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">
            {l.title}
          </h1>
          <p className="text-muted-foreground mt-1">{l.trackQualify}</p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {l.lastRefreshed}: {timeAgoArabic(lastRefreshedAt)}
          </span>
          <RefreshLeadScoresButton />
        </div>
      </header>

      <KpiGrid stats={stats} />

      <LeadsTable leads={leads} />
    </div>
  );
}

// ─── KPI Grid ────────────────────────────────────────────────────────

function KpiGrid({ stats }: { stats: LeadStats }) {
  const l = ar.leads;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <KpiInfoCard
        iconKey="flame"
        tone="red"
        label={l.hotLeads}
        value={stats.hot}
        hint={l.highEngagement}
        infoKey="high"
      />
      <KpiInfoCard
        iconKey="trending-up"
        tone="amber"
        label={l.warmLeads}
        value={stats.warm}
        hint={l.moderateEngagement}
        infoKey="medium"
      />
      <KpiInfoCard
        iconKey="snowflake"
        tone="slate"
        label={l.coldLeads}
        value={stats.cold}
        hint={l.lowEngagement}
        infoKey="low"
      />
      <KpiInfoCard
        iconKey="award"
        tone="primary"
        label={l.qualified}
        value={stats.qualified}
        hint={l.readyForOutreach}
        infoKey="qualified"
      />
      <KpiInfoCard
        iconKey="target"
        tone="muted"
        label={l.avgScore}
        value={stats.avgScore}
        hint={l.outOf100}
        infoKey="avg"
      />
    </div>
  );
}
