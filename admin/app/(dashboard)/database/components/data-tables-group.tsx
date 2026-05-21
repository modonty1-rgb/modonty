"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableInfo {
  name: string;
  label: string;
  count: number;
  group: string;
}

const GROUPS = ["Core", "Content", "Audience", "Analytics", "System"];

export function DataTablesGroup({ tables }: { tables: TableInfo[] }) {
  const populatedGroups = GROUPS
    .map((g) => ({ group: g, items: tables.filter((t) => t.group === g) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold">Data Tables</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Record counts grouped by domain. Click a group to expand.
        </p>
      </div>
      <ul className="divide-y divide-border">
        {populatedGroups.map(({ group, items }) => {
          const total = items.reduce((s, t) => s + t.count, 0);
          return <GroupRow key={group} title={group} total={total} items={items} />;
        })}
      </ul>
    </div>
  );
}

function GroupRow({
  title,
  total,
  items,
}: {
  title: string;
  total: number;
  items: TableInfo[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <span className="text-xs text-muted-foreground">({items.length} tables)</span>
        </div>
        <Badge variant="secondary" className="text-xs font-normal">
          {total.toLocaleString()} records
        </Badge>
      </button>

      {open && (
        <div className="px-4 pb-3 bg-muted/10">
          <div className="rounded-lg border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[120px] text-end">Records</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((t) => (
                  <TableRow key={t.name}>
                    <TableCell className="font-medium">{t.label}</TableCell>
                    <TableCell className="text-end">
                      <span className={t.count === 0 ? "text-muted-foreground" : "font-semibold"}>
                        {t.count.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </li>
  );
}
