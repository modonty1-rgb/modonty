"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CollectionSize } from "../actions/collection-sizes";

interface TableInfo {
  name: string;
  label: string;
  count: number;
  group: string;
}

const GROUPS = ["Core", "Content", "Audience", "Analytics", "System"];

export function DataTablesGroup({
  tables,
  collectionSizes,
}: {
  tables: TableInfo[];
  collectionSizes: CollectionSize[];
}) {
  const maxSizeMB = Math.max(...collectionSizes.map((c) => c.sizeMB), 0.01);

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => {
        const groupTables = tables.filter((t) => t.group === group);
        if (groupTables.length === 0) return null;
        const groupTotal = groupTables.reduce((s, t) => s + t.count, 0);

        return (
          <div key={group} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{group}</h2>
              <Badge variant="secondary" className="text-xs font-normal">
                {groupTotal.toLocaleString()} records
              </Badge>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[120px] text-end">Records</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupTables.map((table) => (
                    <TableRow key={table.name}>
                      <TableCell className="font-medium">{table.label}</TableCell>
                      <TableCell className="text-end">
                        <span className={table.count === 0 ? "text-muted-foreground" : "font-semibold"}>
                          {table.count.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}

      {/* Storage Usage — MongoDB collection sizes */}
      {collectionSizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Storage Usage</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                MongoDB collection sizes — what takes up space on disk.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs font-normal">
              {collectionSizes.reduce((s, c) => s + c.sizeMB, 0).toFixed(2)} MB total
            </Badge>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collection</TableHead>
                  <TableHead className="w-[100px] text-end">Records</TableHead>
                  <TableHead className="w-[80px] text-end">MB</TableHead>
                  <TableHead className="w-[140px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectionSizes.map((col) => (
                  <TableRow key={col.collection}>
                    <TableCell className="font-medium">{col.label}</TableCell>
                    <TableCell className="text-end text-muted-foreground">{col.count.toLocaleString()}</TableCell>
                    <TableCell className="text-end font-mono text-xs">
                      {col.sizeMB > 0 ? col.sizeMB : "—"}
                    </TableCell>
                    <TableCell>
                      {col.sizeMB > 0 && (
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${Math.max((col.sizeMB / maxSizeMB) * 100, 2)}%` }}
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
