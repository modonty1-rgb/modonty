"use client";

import { useMemo, useState } from "react";
import { ExternalLink, CheckCircle2, XCircle, Clock, HelpCircle, ListFilter } from "lucide-react";

import { DataTable } from "@/components/admin/data-table";
import { OpenInGscButton } from "./open-in-gsc-button";

export interface UrlRow {
  id: string; // = url
  url: string;
  decoded: string;
  status: "Indexed" | "Indexed (with notes)" | "Unknown" | "Blocked" | "Pending check";
  rawVerdict: string | null;
  reason: string | null; // coverageState
  lastCrawl: string | null; // ISO date string
  checkedAt: string | null; // ISO date string
}

type FilterValue = "all" | UrlRow["status"];

const STATUS_STYLE: Record<UrlRow["status"], string> = {
  Indexed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  "Indexed (with notes)": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Unknown: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20",
  Blocked: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  "Pending check": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

const STATUS_RANK: Record<UrlRow["status"], number> = {
  Indexed: 0,
  "Indexed (with notes)": 1,
  Unknown: 2,
  Blocked: 3,
  "Pending check": 4,
};

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const ms = Date.now() - date.getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatShortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Props {
  rows: UrlRow[];
}

const FILTER_BUTTONS: Array<{
  value: FilterValue;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  activeCls: string;
  idleCls: string;
}> = [
  {
    value: "all",
    label: "All",
    Icon: ListFilter,
    activeCls: "bg-foreground text-background border-foreground",
    idleCls: "bg-muted/50 text-foreground hover:bg-muted border-transparent",
  },
  {
    value: "Indexed",
    label: "Indexed",
    Icon: CheckCircle2,
    activeCls: "bg-emerald-600 text-white border-emerald-600",
    idleCls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-transparent",
  },
  {
    value: "Indexed (with notes)",
    label: "Indexed (with notes)",
    Icon: CheckCircle2,
    activeCls: "bg-emerald-600 text-white border-emerald-600",
    idleCls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-transparent",
  },
  {
    value: "Blocked",
    label: "Blocked",
    Icon: XCircle,
    activeCls: "bg-red-600 text-white border-red-600",
    idleCls: "bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 border-transparent",
  },
  {
    value: "Unknown",
    label: "Unknown",
    Icon: HelpCircle,
    activeCls: "bg-slate-600 text-white border-slate-600",
    idleCls: "bg-slate-500/10 text-slate-700 dark:text-slate-400 hover:bg-slate-500/20 border-transparent",
  },
  {
    value: "Pending check",
    label: "Pending check",
    Icon: Clock,
    activeCls: "bg-amber-600 text-white border-amber-600",
    idleCls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border-transparent",
  },
];

export function UrlsDataTable({ rows }: Props) {
  const [filter, setFilter] = useState<FilterValue>("all");

  // Counts per status (drives the badges on each button)
  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = {
      all: rows.length,
      Indexed: 0,
      "Indexed (with notes)": 0,
      Unknown: 0,
      Blocked: 0,
      "Pending check": 0,
    };
    for (const r of rows) c[r.status] += 1;
    return c;
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_BUTTONS.map(({ value, label, Icon, activeCls, idleCls }) => {
          const active = filter === value;
          const count = counts[value];
          const disabled = count === 0;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active ? activeCls : idleCls
              } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              <span className="tabular-nums font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      <DataTable<UrlRow>
        data={filteredRows}
        pageSize={20}
        columns={[
          {
            key: "url",
            header: "URL",
            render: (row) => (
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 min-w-0"
              >
                <span className="truncate max-w-[420px]">{row.decoded}</span>
                <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
              </a>
            ),
            sortable: true,
            sortFn: (a, b) => a.decoded.localeCompare(b.decoded),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLE[row.status]}`}>
                {row.status}
              </span>
            ),
            sortable: true,
            sortFn: (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status],
          },
          {
            key: "reason",
            header: "Google's reason",
            render: (row) => (
              <span className="text-xs text-muted-foreground line-clamp-2 max-w-[280px] block">
                {row.reason ?? <span className="text-muted-foreground/50">—</span>}
              </span>
            ),
            sortable: true,
            sortFn: (a, b) => (a.reason ?? "").localeCompare(b.reason ?? ""),
          },
          {
            key: "lastCrawl",
            header: "Last crawl",
            render: (row) => (
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatShortDate(row.lastCrawl)}
              </span>
            ),
            sortable: true,
            sortFn: (a, b) => {
              const at = a.lastCrawl ? new Date(a.lastCrawl).getTime() : 0;
              const bt = b.lastCrawl ? new Date(b.lastCrawl).getTime() : 0;
              return at - bt;
            },
          },
          {
            key: "checkedAt",
            header: "Checked",
            render: (row) => (
              <span className="text-xs text-muted-foreground">
                {row.checkedAt ? formatRelative(row.checkedAt) : <span className="text-amber-600">never</span>}
              </span>
            ),
            sortable: true,
            sortFn: (a, b) => {
              const at = a.checkedAt ? new Date(a.checkedAt).getTime() : 0;
              const bt = b.checkedAt ? new Date(b.checkedAt).getTime() : 0;
              return at - bt;
            },
          },
          {
            key: "action",
            header: "Action",
            render: (row) => <OpenInGscButton url={row.url} />,
          },
        ]}
      />
    </div>
  );
}
