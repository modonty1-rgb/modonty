"use client";

import { CalendarClock } from "lucide-react";

import { DataTable, type Column } from "@/components/admin/data-table";
import { cn } from "@/lib/utils";
import {
  TASK_PRIORITY_META,
  TASK_PRIORITY_WEIGHT,
  TASK_STATUS_META,
  type TaskStatusKey,
} from "@/lib/tasks/task-config";

const dueFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export interface ReportRow {
  id: string;
  title: string;
  person: string;
  personImage: string | null;
  role: string | null;
  status: TaskStatusKey;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  dueDate: Date | null;
  late: boolean;
}

/**
 * The day's work as ONE dense table, not a card per person.
 *
 * Six people with one task each cost 480px as stacked cards — a whole screen to
 * read eight rows. The same eight fit in a third of that here, and the Person
 * column is sortable, so "everything Mariam is holding" is one click rather than
 * a scroll hunt.
 *
 * Built on the shared `DataTable` per the admin entity standard: search, 3-state
 * sort, pagination and the locked 40px row height all come from it, and a change
 * to admin table density reaches this screen without touching it.
 */
export function ReportTable({ rows }: { rows: ReportRow[] }) {
  const columns: Column<ReportRow>[] = [
    {
      key: "person",
      header: "Person",
      sortable: true,
      sortFn: (a, b) => a.person.localeCompare(b.person),
      render: (r) => (
        <span className="flex items-center gap-2">
          {r.personImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- 20px remote avatar; next/image adds a request per row for no gain
            <img src={r.personImage} alt="" className="size-5 rounded-full object-cover" />
          ) : (
            <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
              {r.person.charAt(0)}
            </span>
          )}
          <span className="font-medium">{r.person}</span>
          {r.role && <span className="text-[10px] uppercase text-muted-foreground">{r.role}</span>}
        </span>
      ),
    },
    { key: "title", header: "Task", sortable: true, sortFn: (a, b) => a.title.localeCompare(b.title) },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      // By severity, never alphabetically — "Urgent" would otherwise sort last.
      sortFn: (a, b) => TASK_PRIORITY_WEIGHT[a.priority] - TASK_PRIORITY_WEIGHT[b.priority],
      render: (r) => (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold",
            TASK_PRIORITY_META[r.priority].tone,
          )}
        >
          {TASK_PRIORITY_META[r.priority].label}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortFn: (a, b) => a.status.localeCompare(b.status),
      render: (r) => (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold",
            TASK_STATUS_META[r.status].tone,
          )}
        >
          {TASK_STATUS_META[r.status].label}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due",
      sortable: true,
      sortFn: (a, b) =>
        (a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY) -
        (b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY),
      render: (r) =>
        r.dueDate ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] tabular-nums",
              r.late
                ? "bg-red-500/15 font-medium text-red-600 dark:text-red-400"
                : "text-muted-foreground",
            )}
          >
            <CalendarClock className="size-3" aria-hidden />
            {dueFmt.format(r.dueDate)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <DataTable data={rows} columns={columns} searchKey="title" searchPlaceholder="Search tasks…" pageSize={15} />
  );
}
