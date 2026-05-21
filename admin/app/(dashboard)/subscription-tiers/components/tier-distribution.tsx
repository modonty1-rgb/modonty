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
      <div className="rounded-xl border border-dashed bg-card p-6 text-center">
        <p className="text-sm font-medium">No clients on active plans yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          When clients subscribe, their distribution across plans will appear here.
        </p>
      </div>
    );
  }

  const sorted = [...active].sort((a, b) => b._count.clients - a._count.clients);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold">Client Distribution</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            How your {totalClients} client{totalClients === 1 ? "" : "s"} spread across the active plans
          </p>
        </div>
      </div>

      {/* Stacked horizontal bar */}
      <div className="h-3 rounded-full overflow-hidden flex bg-muted">
        {sorted.map((tier, i) => {
          if (tier._count.clients === 0) return null;
          const pct = (tier._count.clients / totalClients) * 100;
          return (
            <div
              key={tier.id}
              className={PALETTE[i % PALETTE.length]}
              style={{ width: `${pct}%` }}
              title={`${tier.name} — ${tier._count.clients} clients (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        {sorted.map((tier, i) => {
          const pct = (tier._count.clients / totalClients) * 100;
          return (
            <li
              key={tier.id}
              className={`flex items-center justify-between gap-2 text-xs ${
                tier._count.clients === 0 ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2.5 w-2.5 rounded-sm shrink-0 ${PALETTE[i % PALETTE.length]}`} />
                <span className="truncate">{tier.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 tabular-nums text-muted-foreground">
                <span>
                  {tier._count.clients} client{tier._count.clients === 1 ? "" : "s"}
                </span>
                <span className="font-semibold text-foreground w-10 text-end">
                  {pct.toFixed(1)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
