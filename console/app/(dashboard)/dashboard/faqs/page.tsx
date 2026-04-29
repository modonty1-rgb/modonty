import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { redirect } from "next/navigation";
import {
  getClientFaqs,
  getFaqStats,
  type FaqStats,
} from "./helpers/faq-queries";
import { FaqsTable } from "./components/faqs-table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FaqsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [faqs, stats] = await Promise.all([
    getClientFaqs(clientId),
    getFaqStats(clientId),
  ]);

  const f = ar.faqs;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {f.title}
        </h1>
        <p className="text-muted-foreground mt-1">{f.description}</p>
      </header>

      <KpiGrid stats={stats} />

      <FaqsTable faqs={faqs} />
    </div>
  );
}

// ─── KPI Grid ────────────────────────────────────────────────────────

function KpiGrid({ stats }: { stats: FaqStats }) {
  const f = ar.faqs;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        icon={Clock}
        tone="amber"
        label={f.pending}
        value={stats.pending}
        hint={f.awaitingApproval}
      />
      <KpiCard
        icon={CheckCircle}
        tone="emerald"
        label={f.published}
        value={stats.published}
        hint={f.publishedFaqs}
      />
      <KpiCard
        icon={XCircle}
        tone="slate"
        label={f.rejected}
        value={stats.rejected}
        hint={f.rejectedFaqs}
      />
      <KpiCard
        icon={Users}
        tone="violet"
        label={f.fromReadersKpi}
        value={stats.fromReaders}
        hint={f.fromReadersHint}
      />
      <KpiCard
        icon={MessageSquare}
        tone="muted"
        label={f.total}
        value={stats.total}
        hint={f.allFaqs}
      />
    </div>
  );
}

function KpiCard({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "amber" | "emerald" | "slate" | "violet" | "muted";
  label: string;
  value: number;
  hint: string;
}) {
  const toneClasses = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    muted: "bg-muted text-muted-foreground ring-border",
  }[tone];
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${toneClasses}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight tabular-nums">
            {value}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
