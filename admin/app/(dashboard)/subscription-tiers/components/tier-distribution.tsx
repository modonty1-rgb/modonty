"use client";

interface TierInfo {
  id: string;
  name: string;
  isActive: boolean;
  _count: { clients: number };
}

const PALETTE = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-500",
];

export function TierDistribution({ tiers }: { tiers: TierInfo[] }) {
  const active = tiers.filter((t) => t.isActive);
  const totalClients = active.reduce((s, t) => s + t._count.clients, 0);

  if (totalClients === 0) {
    return (
      <div className="rounded-md border border-dashed bg-card px-3 py-2 text-xs text-muted-foreground">
        No clients on active plans yet.
      </div>
    );
  }

  const sorted = [...active].sort((a, b) => b._count.clients - a._count.clients);

  return (
    <div className="rounded-md border bg-card px-3 py-2 flex items-center gap-3 flex-wrap">
      <span className="text-xs font-semibold text-muted-foreground shrink-0">
        Distribution · {totalClients}
      </span>

      {/* Inline legend — compact pills */}
      <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
        {sorted.map((tier, i) => {
          if (tier._count.clients === 0) return null;
          const pct = (tier._count.clients / totalClients) * 100;
          return (
            <span key={tier.id} className="flex items-center gap-1.5 text-[11px]">
              <span className={`h-2 w-2 rounded-sm shrink-0 ${PALETTE[i % PALETTE.length]}`} />
              <span className="text-muted-foreground">{tier.name}</span>
              <span className="font-semibold tabular-nums">{tier._count.clients}</span>
              <span className="text-muted-foreground/70 tabular-nums">({pct.toFixed(0)}%)</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
