"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, Clock } from "lucide-react";
import { IndustryRowActions } from "./industry-row-actions";
import { SortableValue } from "@/lib/types";

interface Industry {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  _count: { clients: number };
  seoTitle?: string | null;
  seoDescription?: string | null;
  jsonLdLastGenerated?: Date | null;
  [key: string]: unknown;
}

interface IndustryTableProps {
  industries: Industry[];
}

type SortDirection = "asc" | "desc" | null;

const dateFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

export function IndustryTable({ industries }: IndustryTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    let result = [...industries];
    if (sortKey && sortDirection) {
      result = [...result].sort((a, b) => {
        let aValue: SortableValue;
        let bValue: SortableValue;
        if (sortKey === "name") { aValue = a.name; bValue = b.name; }
        else if (sortKey === "clients") { aValue = a._count.clients; bValue = b._count.clients; }
        else if (sortKey === "createdAt") { aValue = a.createdAt; bValue = b.createdAt; }
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        if (typeof aValue === "string" && typeof bValue === "string") return aValue.localeCompare(bValue);
        if (typeof aValue === "number" && typeof bValue === "number") return aValue - bValue;
        if (aValue instanceof Date && bValue instanceof Date) return aValue.getTime() - bValue.getTime();
        return String(aValue).localeCompare(String(bValue));
      });
      if (sortDirection === "desc") result.reverse();
    }
    return result;
  }, [industries, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else { setSortKey(null); setSortDirection(null); }
    } else { setSortKey(key); setSortDirection("asc"); }
    setCurrentPage(1);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="ms-1.5 h-3 w-3 text-muted-foreground/50" />;
    if (sortDirection === "asc") return <ArrowUp className="ms-1.5 h-3 w-3 text-primary" />;
    return <ArrowDown className="ms-1.5 h-3 w-3 text-primary" />;
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="space-y-3">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                <div className="flex items-center text-[11px] uppercase tracking-wider font-semibold">Name{getSortIcon("name")}</div>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("clients")}>
                <div className="flex items-center text-[11px] uppercase tracking-wider font-semibold">Clients{getSortIcon("clients")}</div>
              </TableHead>
              <TableHead><span className="text-[11px] uppercase tracking-wider font-semibold">SEO</span></TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center text-[11px] uppercase tracking-wider font-semibold">Created{getSortIcon("createdAt")}</div>
              </TableHead>
              <TableHead className="w-[100px]"><span className="text-[11px] uppercase tracking-wider font-semibold">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <p className="text-sm font-medium text-muted-foreground">No industries found</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters or search terms</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((industry) => (
                <TableRow key={industry.id} className="cursor-pointer transition-colors" onClick={() => router.push(`/industries/${industry.id}`)}>
                  <TableCell className="py-3">
                    <div>
                      <span className="font-medium text-sm hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); router.push(`/industries/${industry.id}`); }}>{industry.name}</span>
                      <p className="text-[11px] text-muted-foreground/60 font-mono mt-0.5">{industry.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                    <Badge variant={industry._count.clients > 0 ? "default" : "secondary"} className={`text-xs tabular-nums ${industry._count.clients === 0 ? "opacity-50" : ""}`}>
                      {industry._count.clients}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                    {industry.jsonLdLastGenerated ? (
                      <div className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><span className="text-xs text-emerald-500">Cached</span></div>
                    ) : (
                      <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-yellow-500" /><span className="text-xs text-yellow-500">Pending</span></div>
                    )}
                  </TableCell>
                  <TableCell className="py-3"><span className="text-xs text-muted-foreground tabular-nums">{dateFormatter.format(new Date(industry.createdAt))}</span></TableCell>
                  <TableCell className="py-3" onClick={(e) => e.stopPropagation()}><IndustryRowActions industryId={industry.id} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground/60">{startIndex + 1}–{Math.min(endIndex, filteredData.length)} of {filteredData.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous page"><ChevronLeft className="h-3.5 w-3.5" /></Button>
            <span className="text-xs text-muted-foreground px-2 tabular-nums">{currentPage} / {totalPages}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Next page"><ChevronRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
