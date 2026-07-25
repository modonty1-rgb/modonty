import Link from "next/link";
import { Users, UserX } from "lucide-react";

import { GroupLabel, IBOX } from "../dashboard-ui";
import { PipelineRow, RAIL, NUM } from "../pipeline-row";

export interface SalesRepsSummaryData {
  /** Each rep with how many clients they brought, busiest first. */
  reps: Array<{ name: string; count: number }>;
  unassignedCount: number;
  /** The actual clients with no rep — so the admin can go assign one. */
  unassigned: Array<{ id: string; name: string }>;
}

/**
 * Sales reps in the SAME row language as every other group on this section
 * (Khalid 2026-07-25: «امشى على نفس النمط»): GroupLabel + a bordered card of rows.
 * Each rep is a healthy (green) PipelineRow; "No sales rep" is a warm (amber) row that
 * expands to list the unassigned clients inside the same card — one click to assign.
 */
export function SalesRepsSummary({ reps, unassignedCount, unassigned }: SalesRepsSummaryData) {
  if (reps.length === 0 && unassignedCount === 0) return null;

  return (
    <>
      <GroupLabel icon={Users} hint="— who brought each client, and who has no rep yet">
        Sales reps
      </GroupLabel>
      <div className="mb-3 overflow-hidden rounded-xl border bg-card shadow-sm">
        {reps.map((r) => (
          <PipelineRow
            key={r.name}
            href="/clients/accounts"
            tier="ok"
            icon={Users}
            value={r.count}
            label={r.name}
            note="clients brought"
          />
        ))}

        {unassignedCount > 0 && (
          <details className="group border-b last:border-b-0">
            <summary className="relative grid cursor-pointer list-none grid-cols-[2.25rem_4.5rem_1fr] items-center gap-3 px-4 py-2.5 transition hover:bg-muted/40 md:grid-cols-[2.25rem_4.5rem_1fr_auto]">
              <span className={`absolute inset-y-0 start-0 w-0.5 ${RAIL.warm}`} />
              <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg ${IBOX.warm}`}>
                <UserX className="h-4 w-4" />
              </span>
              <span className={`text-xl font-extrabold leading-none tabular-nums ${NUM.warm}`}>
                {unassignedCount.toLocaleString("en-US")}
              </span>
              <span className="text-[13px] leading-snug">
                No sales rep
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  not assigned to anyone — click to assign
                </span>
              </span>
              <span className="hidden text-[11.5px] font-bold text-primary md:block">
                <span className="group-open:hidden">show →</span>
                <span className="hidden group-open:inline">hide ↑</span>
              </span>
            </summary>
            <ul className="divide-y border-t bg-muted/20">
              {unassigned.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/clients/${c.id}/edit`}
                    className="flex items-center justify-between gap-2 py-2 pe-4 ps-[3.5rem] text-[13px] hover:bg-muted/40"
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="shrink-0 text-[11.5px] font-bold text-primary">assign →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </>
  );
}
