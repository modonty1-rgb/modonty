import { Users, Globe, Repeat, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getJbrseoSubscribers,
  getJbrseoSubscriberStats,
} from "./helpers/queries";
import { SyncButton } from "./components/sync-button";
import { SubscribersTable } from "./components/subscribers-table";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function JbrseoSubscribersPage() {
  const [rows, stats] = await Promise.all([
    getJbrseoSubscribers(),
    getJbrseoSubscriberStats(),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 p-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary grid h-10 w-10 place-items-center rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">
              jbrseo Subscribers
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              People who signed up via jbrseo&apos;s pricing page · synced
              manually
            </p>
          </div>
        </div>
        <SyncButton />
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Total"
          value={stats.total}
          tone="primary"
        />
        <KpiCard
          icon={Globe}
          label="Saudi Arabia"
          value={stats.bySa}
          tone="emerald"
        />
        <KpiCard
          icon={Globe}
          label="Egypt"
          value={stats.byEg}
          tone="amber"
        />
        <KpiCard
          icon={Repeat}
          label={`${stats.annual} annual / ${stats.monthly} monthly`}
          value={stats.annual + stats.monthly}
          tone="violet"
        />
      </div>

      {/* Last sync */}
      {stats.lastSyncedAt && (
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5" />
          Last synced: {dateFmt.format(new Date(stats.lastSyncedAt))}
        </p>
      )}

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <SubscribersTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone: "primary" | "emerald" | "amber" | "violet";
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  }[tone];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-lg ${toneClasses}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold leading-tight">{value}</p>
            <p className="text-muted-foreground text-xs">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
