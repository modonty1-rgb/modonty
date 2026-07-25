import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Activity, CalendarDays, Clock, Layers } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getUserById } from "../../actions/users-actions";
import {
  getAuditLogs,
  getStaffActivitySummary,
} from "../../../audit-log/actions/audit-log-actions";
import { AuditLogTable } from "../../../audit-log/components/audit-log-table";
import {
  friendlyAction,
  actionTone,
  entityCategory,
  type CategoryMeta,
} from "../../../audit-log/lib/audit-labels";

interface StaffLogPageProps {
  params: Promise<{ id: string }>;
}

function initials(name: string | null, email: string | null): string {
  return (name?.trim() || email || "S").slice(0, 2).toUpperCase();
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums leading-none">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default async function StaffLogPage({ params }: StaffLogPageProps) {
  const { id } = await params;

  const [staff, summary, rows] = await Promise.all([
    getUserById(id),
    getStaffActivitySummary(id),
    getAuditLogs({ userId: id }),
  ]);

  if (!staff) redirect("/users");

  const name = staff.name || staff.email || "Staff";

  // Fold entities into the handful of areas a person works in.
  const catMap = new Map<string, CategoryMeta & { count: number }>();
  for (const { entity, count } of summary.byEntity) {
    const meta = entityCategory(entity);
    const prev = catMap.get(meta.key);
    catMap.set(meta.key, { ...meta, count: (prev?.count ?? 0) + count });
  }
  const categories = [...catMap.values()].sort((a, b) => b.count - a.count);
  const maxCat = Math.max(1, ...categories.map((c) => c.count));
  const maxDaily = Math.max(1, ...summary.daily.map((d) => d.count));

  return (
    <div className="max-w-[1200px] mx-auto">
      <Link
        href="/users"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Staff
      </Link>

      {/* Identity */}
      <div className="flex items-center gap-3 mb-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
          {initials(staff.name, staff.email)}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold leading-tight truncate">{name}</h1>
            <Badge className="border-transparent bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
              Admin
            </Badge>
          </div>
          {staff.email && <p className="text-sm text-muted-foreground truncate">{staff.email}</p>}
        </div>
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat icon={Activity} label="Total actions" value={summary.total.toLocaleString()} hint="All time" />
        <Stat icon={CalendarDays} label="Last 7 days" value={summary.last7.toLocaleString()} />
        <Stat icon={CalendarDays} label="Last 30 days" value={summary.last30.toLocaleString()} />
        <Stat
          icon={Clock}
          label="Last active"
          value={summary.lastActiveAt ? formatDistanceToNow(summary.lastActiveAt, { addSuffix: true }) : "—"}
          hint={summary.lastActiveAt ? format(summary.lastActiveAt, "PPp") : undefined}
        />
      </div>

      {/* Where the work goes + rhythm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Where the work goes</h2>
          </div>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-2.5">
              {categories.map((c) => (
                <div key={c.key} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-muted-foreground">{c.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", c.bar)}
                      style={{ width: `${Math.max(4, (c.count / maxCat) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums">{c.count}</span>
                </div>
              ))}
            </div>
          )}

          {summary.topActions.length > 0 && (
            <>
              <div className="mt-5 mb-2 text-xs font-medium text-muted-foreground">Most-used actions</div>
              <div className="flex flex-wrap gap-1.5">
                {summary.topActions.map((a) => (
                  <span
                    key={a.action}
                    className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
                  >
                    <Badge className={cn("border-transparent font-medium", actionTone(a.action))}>
                      {friendlyAction(a.action)}
                    </Badge>
                    <span className="tabular-nums text-muted-foreground">{a.count}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Activity — last 14 days</h2>
          </div>
          <div className="flex items-end justify-between gap-1 h-28">
            {summary.daily.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.day} · ${d.count}`}>
                <div
                  className={cn("w-full rounded-t", d.count > 0 ? "bg-primary" : "bg-muted")}
                  style={{ height: `${d.count > 0 ? Math.max(6, (d.count / maxDaily) * 100) : 3}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{summary.daily[0] ? format(new Date(summary.daily[0].day), "MMM d") : ""}</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Full detail */}
      <h2 className="text-sm font-semibold mb-3">All activity</h2>
      <AuditLogTable rows={rows} hideWho showSearch={false} />
    </div>
  );
}
