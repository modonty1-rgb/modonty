"use client";

import { Users, TrendingUp, Star, FileText, Inbox } from "lucide-react";
import { resolvePricing } from "../lib/pricing";

interface TierInfo {
  id: string;
  name: string;
  articlesPerMonth: number;
  price: number;
  isPopular: boolean;
  isActive: boolean;
  pricing: unknown;
  _count: { clients: number };
}

interface SignupsSummary {
  total: number;
  lastSyncedAt: Date | null;
}

export function TierKpiStrip({
  tiers,
  signups,
}: {
  tiers: TierInfo[];
  signups: SignupsSummary | null;
}) {
  const activeTiers = tiers.filter((t) => t.isActive);
  const totalClients = activeTiers.reduce((s, t) => s + t._count.clients, 0);

  // Estimated annual revenue in SAR — uses the yearly (yr) monthly equivalent × 12 × client count.
  const estimatedSAR = activeTiers.reduce((sum, t) => {
    const p = resolvePricing(t.name, t.pricing);
    return sum + p.SA.yr * 12 * t._count.clients;
  }, 0);

  // Most popular tier by current client count (NOT the isPopular flag — that's the marketing default).
  const mostPopular = [...activeTiers].sort((a, b) => b._count.clients - a._count.clients)[0];

  // Average article quota — weighted by client count.
  const weightedQuotaSum = activeTiers.reduce(
    (sum, t) => sum + t.articlesPerMonth * t._count.clients,
    0,
  );
  const avgQuota = totalClients > 0 ? Math.round(weightedQuotaSum / totalClients) : 0;

  const syncedHint = signups?.lastSyncedAt
    ? `last synced ${timeAgo(signups.lastSyncedAt)}`
    : "never synced";

  return (
    <div className={`grid grid-cols-2 gap-3 ${signups ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
      <KpiCard
        tone="violet"
        icon={<Users className="h-4 w-4" />}
        label="Active Clients"
        value={totalClients.toString()}
        hint={`across ${activeTiers.length} active plan${activeTiers.length === 1 ? "" : "s"}`}
      />
      <KpiCard
        tone="emerald"
        icon={<TrendingUp className="h-4 w-4" />}
        label="Est. Annual Revenue"
        value={
          <>
            {new Intl.NumberFormat("en-US").format(estimatedSAR)}{" "}
            <span className="text-xs font-normal text-muted-foreground">SAR</span>
          </>
        }
        hint="based on yearly plan rate"
      />
      <KpiCard
        tone="amber"
        icon={<Star className="h-4 w-4" />}
        label="Most Adopted Tier"
        value={mostPopular?._count.clients ? mostPopular.name : "—"}
        hint={
          mostPopular?._count.clients
            ? `${mostPopular._count.clients} client${mostPopular._count.clients === 1 ? "" : "s"}`
            : "no clients yet"
        }
      />
      <KpiCard
        tone="blue"
        icon={<FileText className="h-4 w-4" />}
        label="Avg Articles / Client"
        value={avgQuota.toString()}
        hint="weighted by client count"
      />
      {signups && (
        <KpiCard
          tone="pink"
          icon={<Inbox className="h-4 w-4" />}
          label="jbrseo Signups"
          value={signups.total.toString()}
          hint={syncedHint}
        />
      )}
    </div>
  );
}

function timeAgo(d: Date): string {
  const ms = Date.now() - new Date(d).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TONE_BG: Record<string, string> = {
  violet: "bg-violet-500/15 text-violet-500",
  emerald: "bg-emerald-500/15 text-emerald-500",
  amber: "bg-amber-500/15 text-amber-500",
  blue: "bg-blue-500/15 text-blue-500",
  pink: "bg-pink-500/15 text-pink-500",
};

function KpiCard({
  tone,
  icon,
  label,
  value,
  hint,
}: {
  tone: string;
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3.5 flex items-start gap-3">
      <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${TONE_BG[tone]}`}>
        {icon}
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
