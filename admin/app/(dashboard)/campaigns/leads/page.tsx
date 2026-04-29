import { Megaphone, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { getCampaignLeads, getCampaignLeadStats } from "./actions/leads-actions";
import { LeadsTable } from "./components/leads-table";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CampaignLeadsPage() {
  const [leads, stats] = await Promise.all([
    getCampaignLeads(),
    getCampaignLeadStats(),
  ]);

  return (
    <div className="max-w-[1280px] mx-auto p-6 space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Campaign Leads</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Clients who clicked &quot;I&apos;m interested&quot; on the campaigns teaser. Reach out within 24 hours for best conversion.
            </p>
          </div>
        </div>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label="New"
          value={stats.NEW}
          icon={Sparkles}
          tone="primary"
          hint="Awaiting first contact"
        />
        <KpiCard
          label="Contacted"
          value={stats.CONTACTED}
          icon={Megaphone}
          tone="amber"
          hint="In conversation"
        />
        <KpiCard
          label="Converted"
          value={stats.CONVERTED}
          icon={CheckCircle2}
          tone="emerald"
          hint="Booked / paid"
        />
        <KpiCard
          label="Cancelled"
          value={stats.CANCELLED}
          icon={XCircle}
          tone="slate"
          hint="Declined / unresponsive"
        />
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "amber" | "emerald" | "slate";
  hint: string;
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary ring-primary/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight tabular-nums">{value}</p>
          <p className="text-[11px] text-muted-foreground truncate">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
