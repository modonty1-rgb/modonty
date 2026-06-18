import { Cloud, DollarSign, ShieldCheck, ShieldAlert, Server, CloudOff } from "lucide-react";
import { FLEX_BASE_USD, FLEX_CAP_USD, type AtlasReport } from "@/lib/atlas/atlas-client";

function fmtUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtMonth(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function AtlasClusterCard({ report }: { report: AtlasReport | null }) {
  // Unavailable (no creds, or IP-blocked in production).
  if (!report || (!report.cluster && !report.billing && !report.backups)) {
    return (
      <section className="rounded-xl border bg-card p-4">
        <Header />
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-dashed bg-muted/20 p-4">
          <CloudOff className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Atlas data unavailable</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              The Atlas API key is IP-restricted. This panel shows live data when viewed
              from an allowed IP (local dev). To enable it on production, add the server&apos;s
              IP (or 0.0.0.0/0) to the key&apos;s API Access List and set the ATLAS_* env vars on Vercel.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { cluster, billing, backups } = report;

  return (
    <section className="rounded-xl border bg-card p-4">
      <Header />
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cluster */}
        <Tile icon={<Server className="h-4 w-4" />} tone="blue" title="Cluster">
          {cluster ? (
            <>
              <Row label="Name" value={cluster.name} />
              <Row label="Tier" value="Flex" />
              <Row label="Provider" value={`${cluster.provider} · ${cluster.region}`} />
              <Row label="MongoDB" value={cluster.version} />
              <Row label="State" value={cluster.state} />
            </>
          ) : (
            <Empty />
          )}
        </Tile>

        {/* Cost */}
        <Tile icon={<DollarSign className="h-4 w-4" />} tone="emerald" title="Cost (this month)">
          {billing ? (
            <>
              <div className="text-2xl font-bold tabular-nums leading-tight">
                {fmtUsd(billing.pendingUsd)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                base {fmtUsd(FLEX_BASE_USD)}/mo · cap {fmtUsd(FLEX_CAP_USD)}/mo
              </p>
              <div className="mt-2 space-y-1 border-t pt-2">
                {billing.history.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{fmtMonth(h.start)}</span>
                    <span className="tabular-nums font-medium">
                      {h.status === "FREE" ? "Free" : fmtUsd(h.usd)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Empty />
          )}
        </Tile>

        {/* Backups */}
        <Tile
          icon={
            backups?.count || cluster?.backupEnabled ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )
          }
          tone={cluster?.backupEnabled ? "violet" : "amber"}
          title="Backups"
        >
          {backups || cluster ? (
            <>
              <Row
                label="Auto-backup"
                value={cluster?.backupEnabled ? "Enabled" : "Disabled"}
              />
              <Row label="Snapshots" value={String(backups?.count ?? 0)} />
              <Row
                label="Latest"
                value={
                  backups?.latest
                    ? new Date(backups.latest).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "none yet"
                }
              />
              <p className="text-[11px] text-muted-foreground mt-1.5 border-t pt-1.5">
                Daily snapshot · last 8 days retained (Flex)
              </p>
            </>
          ) : (
            <Empty />
          )}
        </Tile>
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-2">
      <Cloud className="h-4 w-4 text-muted-foreground" />
      <h2 className="text-sm font-semibold">Atlas Cluster</h2>
      <span className="text-[10px] text-muted-foreground">· live from MongoDB Atlas</span>
    </div>
  );
}

const TONE_BG: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-500",
  emerald: "bg-emerald-500/15 text-emerald-500",
  violet: "bg-violet-500/15 text-violet-500",
  amber: "bg-amber-500/15 text-amber-500",
};

function Tile({
  icon,
  tone,
  title,
  children,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2">
        <div className={`size-7 rounded-md flex items-center justify-center shrink-0 ${TONE_BG[tone] ?? TONE_BG.blue}`}>
          {icon}
        </div>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {title}
        </span>
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-end truncate">{value}</span>
    </div>
  );
}

function Empty() {
  return <p className="text-[11px] text-muted-foreground">—</p>;
}
