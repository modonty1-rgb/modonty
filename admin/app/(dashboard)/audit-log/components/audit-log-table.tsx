"use client";

import { useMemo } from "react";
import { format } from "date-fns";

import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AuditLogRow } from "../actions/audit-log-actions";
import { friendlyAction, actionTone } from "../lib/audit-labels";

interface AuditLogTableProps {
  rows: AuditLogRow[];
  /** Hide the "Who" column when the whole feed is one person (the header already names them). */
  hideWho?: boolean;
  /** Show the search box. Off for a single-person feed where "by person" is pointless. */
  showSearch?: boolean;
}

// A pre-joined haystack so the single-key DataTable search covers person + action + target.
type Row = AuditLogRow & { _search: string };

function initials(name: string | null, email: string): string {
  const base = name?.trim() || email;
  return base.slice(0, 2).toUpperCase();
}

export function AuditLogTable({ rows, hideWho = false, showSearch = true }: AuditLogTableProps) {
  const data: Row[] = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        _search: [r.userName, r.userEmail, r.summary, friendlyAction(r.action)]
          .filter(Boolean)
          .join(" "),
      })),
    [rows]
  );

  const columns = useMemo(() => {
    const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();
    // Each part of the timestamp is its own sortable column — sort by Day to cluster
    // weekdays, by Date for chronology, by Time to see when in the day people work.
    const cols: Column<Row>[] = [
      {
        key: "day",
        header: "Day",
        sortFn: (a, b) => new Date(a.createdAt).getDay() - new Date(b.createdAt).getDay(),
        render: (r) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
            {format(new Date(r.createdAt), "EEE")}
          </span>
        ),
      },
      {
        key: "date",
        header: "Date",
        sortFn: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        render: (r) => (
          <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap" suppressHydrationWarning>
            {format(new Date(r.createdAt), "d MMM yyyy")}
          </span>
        ),
      },
      {
        key: "time",
        header: "Time",
        sortFn: (a, b) => minutesOfDay(new Date(a.createdAt)) - minutesOfDay(new Date(b.createdAt)),
        render: (r) => (
          <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap" suppressHydrationWarning>
            {format(new Date(r.createdAt), "h:mm a")}
          </span>
        ),
      },
    ];

    if (!hideWho) {
      cols.push({
        key: "userName",
        header: "Who",
        render: (r) => (
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
              {initials(r.userName, r.userEmail)}
            </span>
            <span className="font-medium truncate">{r.userName || r.userEmail}</span>
          </div>
        ),
      });
    }

    cols.push(
      {
        key: "action",
        header: "Action",
        sortFn: (a, b) => friendlyAction(a.action).localeCompare(friendlyAction(b.action)),
        render: (r) => (
          <Badge className={cn("border-transparent font-medium whitespace-nowrap", actionTone(r.action))}>
            {friendlyAction(r.action)}
          </Badge>
        ),
      },
      {
        key: "summary",
        header: "On",
        render: (r) => <span className="text-sm">{r.summary || "—"}</span>,
      }
    );

    return cols;
  }, [hideWho]);

  return (
    <DataTable
      data={data}
      columns={columns}
      searchKey={showSearch ? "_search" : undefined}
      searchPlaceholder="Search by person or what changed..."
      pageSize={20}
    />
  );
}
