import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ar } from "@/lib/ar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  TrendingUp,
} from "lucide-react";
import {
  getSubscribers,
  getSubscriberStats,
  type SubscriberStats,
} from "./helpers/subscriber-queries";
import { SubscribersTable } from "./components/subscribers-table";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [subscribers, stats] = await Promise.all([
    getSubscribers(clientId),
    getSubscriberStats(clientId),
  ]);

  const s = ar.subscribers;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {s.title}
        </h1>
        <p className="text-muted-foreground mt-1">{s.manageNewsletter}</p>
      </header>

      <KpiGrid stats={stats} />

      <SubscribersTable subscribers={subscribers} />
    </div>
  );
}

// ─── KPI Grid ────────────────────────────────────────────────────────

function KpiGrid({ stats }: { stats: SubscriberStats }) {
  const s = ar.subscribers;
  const consentRate =
    stats.total > 0 ? Math.round((stats.withConsent / stats.total) * 100) : 0;
  const churnedRate =
    stats.total > 0
      ? Math.round((stats.unsubscribed / stats.total) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        icon={UserCheck}
        tone="emerald"
        label={s.active}
        value={stats.active}
        hint={s.subscribedUsers}
      />
      <KpiCard
        icon={Shield}
        tone="primary"
        label={s.gdprConsent}
        value={stats.withConsent}
        hint={`${consentRate}% ${s.consentLabel}`}
      />
      <KpiCard
        icon={TrendingUp}
        tone="violet"
        label={s.thisMonth}
        value={stats.thisMonth}
        hint={s.newSubscribers}
      />
      <KpiCard
        icon={UserX}
        tone="slate"
        label={s.unsubscribed}
        value={stats.unsubscribed}
        hint={`${churnedRate}% ${s.leftTheList}`}
      />
      <KpiCard
        icon={Users}
        tone="muted"
        label={s.total}
        value={stats.total}
        hint={s.allSubscribers}
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
  tone: "emerald" | "primary" | "violet" | "slate" | "muted";
  label: string;
  value: number;
  hint: string;
}) {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    primary: "bg-primary/10 text-primary ring-primary/20",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
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
          <p className="text-2xl font-bold leading-tight tabular-nums">{value}</p>
          <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
