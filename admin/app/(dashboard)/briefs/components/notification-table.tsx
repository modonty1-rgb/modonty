"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, CheckCheck } from "lucide-react";
import type { NotificationPriority } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { BriefNotification } from "../helpers/load-brief-detail";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const PRIORITY: Record<NotificationPriority, { label: string; className: string; rank: number }> = {
  URGENT: { label: "عاجل", className: "bg-red-500/10 text-red-700 dark:text-red-400", rank: 3 },
  IMPORTANT: { label: "مهم", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400", rank: 2 },
  NORMAL: { label: "عادي", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", rank: 1 },
};

type SortKey = "date" | "priority" | "sender" | "delivery";

/**
 * Priority sorts by SEVERITY, not by its Arabic label: alphabetically «عاجل» would land between
 * «عادي» and «مهم», which is the opposite of what someone scanning for the urgent ones wants.
 */
function sortValue(n: BriefNotification, key: SortKey): number | string {
  switch (key) {
    case "date":
      return new Date(n.createdAt).getTime();
    case "priority":
      return PRIORITY[n.priority].rank;
    case "sender":
      return n.sentByName;
    case "delivery":
      return n.delivered ? 1 : 0;
  }
}

export function NotificationTable({ items }: { items: BriefNotification[] }) {
  // Newest first by default — a log is read from its top.
  const [sort, setSort] = useState<SortKey>("date");
  const [asc, setAsc] = useState(false);

  const toggleSort = (key: SortKey) => {
    if (sort === key) {
      setAsc((v) => !v);
      return;
    }
    setSort(key);
    // A date column opens newest-first; the text ones open A→Z.
    setAsc(key !== "date");
  };

  const rows = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      const va = sortValue(a, sort);
      const vb = sortValue(b, sort);
      const diff =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "ar");
      return asc ? diff : -diff;
    });
    return copy;
  }, [items, sort, asc]);

  const Th = ({
    label,
    sortKey,
    className,
  }: {
    label: string;
    sortKey?: SortKey;
    className?: string;
  }) => {
    const active = sortKey && sort === sortKey;
    const Icon = active ? (asc ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <TableHead
        className={cn(
          "h-auto bg-muted/40 px-2 py-2 text-start text-[11px] font-semibold text-muted-foreground",
          className
        )}
        aria-sort={active ? (asc ? "ascending" : "descending") : undefined}
      >
        {sortKey ? (
          <button
            type="button"
            onClick={() => toggleSort(sortKey)}
            className="inline-flex items-center gap-1 leading-tight transition-colors hover:text-foreground"
          >
            <span>{label}</span>
            <Icon className={cn("h-3 w-3 shrink-0", active ? "text-foreground" : "opacity-40")} />
          </button>
        ) : (
          label
        )}
      </TableHead>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {/* التاريخ أوّلاً (خالد، ١ سبتمبر): السجلّ يُقرأ زمنياً، فالعمود الذي يُرتَّب به
                افتراضياً هو أوّل ما تقع عليه العين عند بداية السطر. */}
            <Th label="التاريخ" sortKey="date" className="w-[150px]" />
            <Th label="الأولوية" sortKey="priority" className="w-[86px]" />
            <Th label="التبليغ" />
            <Th label="لمين" className="w-[150px]" />
            <Th label="مين بلّغ" sortKey="sender" className="w-[120px]" />
            <Th label="وصلت؟" sortKey="delivery" className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((n) => {
            const p = PRIORITY[n.priority];
            return (
              <TableRow key={n.id} className="align-top">
                <TableCell className="px-2 py-2.5 text-[10.5px] whitespace-nowrap text-muted-foreground" dir="ltr">
                  {dateFmt.format(new Date(n.createdAt))}
                </TableCell>
                <TableCell className="px-2 py-2.5">
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold", p.className)}>
                    {p.label}
                  </span>
                </TableCell>
                <TableCell className="px-2 py-2.5">
                  <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed">{n.message}</p>
                  {/* The failure reason belongs with the message it failed to deliver. */}
                  {!n.delivered && n.error && (
                    <p className="mt-1 rounded border border-red-500/25 bg-red-500/5 px-2 py-1 text-[10.5px] text-red-600 dark:text-red-400">
                      {n.error}
                    </p>
                  )}
                </TableCell>
                <TableCell className="px-2 py-2.5 text-[11px] text-muted-foreground">
                  {n.recipientNames.length > 0 ? n.recipientNames.join(" · ") : "📣 الكل"}
                </TableCell>
                <TableCell className="px-2 py-2.5 text-[11px] font-medium">{n.sentByName}</TableCell>
                <TableCell className="px-2 py-2.5">
                  {n.delivered ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] text-emerald-600 dark:text-emerald-400">
                      <CheckCheck className="h-3 w-3" aria-hidden="true" />
                      وصلت
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-[10.5px] text-red-600 dark:text-red-400"
                      title={n.error ?? undefined}
                    >
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      ما وصلت
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
