"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, Stethoscope } from "lucide-react";
import { IndustryRowActions } from "./industry-row-actions";
import { SEOHealthGauge } from "@/components/shared/seo-doctor/seo-health-gauge";
import { industrySEOConfig } from "../helpers/industry-seo-config";
import { SortableValue } from "@/lib/types";

interface Industry {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  _count: {
    clients: number;
  };
  seoTitle?: string | null;
  seoDescription?: string | null;
  [key: string]: unknown;
}

interface IndustryTableProps {
  industries: Industry[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

type SortDirection = "asc" | "desc" | null;

export function IndustryTable({ industries, onSelectionChange }: IndustryTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pageSize = 10;

  const filteredData = useMemo(() => {
    let result = industries.filter((industry) => {
      const searchTerm = search.toLowerCase();
      return (
        industry.name.toLowerCase().includes(searchTerm) ||
        industry.slug.toLowerCase().includes(searchTerm)
      );
    });

    if (sortKey && sortDirection) {
      result = [...result].sort((a, b) => {
        let aValue: SortableValue;
        let bValue: SortableValue;

        if (sortKey === "name") {
          aValue = a.name;
          bValue = b.name;
        } else if (sortKey === "slug") {
          aValue = a.slug;
          bValue = b.slug;
        } else if (sortKey === "clients") {
          aValue = a._count.clients;
          bValue = b._count.clients;
        } else if (sortKey === "createdAt") {
          aValue = a.createdAt;
          bValue = b.createdAt;
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return aValue - bValue;
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return aValue.getTime() - bValue.getTime();
        }
        return String(aValue).localeCompare(String(bValue));
      });

      if (sortDirection === "desc") {
        result.reverse();
      }
    }

    return result;
  }, [industries, search, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const allSelected = paginatedData.length > 0 && paginatedData.every((industry) => selectedIds.has(industry.id));
  const someSelected = paginatedData.some((industry) => selectedIds.has(industry.id));

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      paginatedData.forEach((industry) => newSelected.add(industry.id));
    } else {
      paginatedData.forEach((industry) => newSelected.delete(industry.id));
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSelectOne = (industryId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(industryId);
    } else {
      newSelected.delete(industryId);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search industries..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
              <TableHead className="w-[70px]">
                <Stethoscope className="h-4 w-4 text-primary" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Name
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("slug")}
              >
                <div className="flex items-center">
                  Slug
                  {getSortIcon("slug")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("clients")}
              >
                <div className="flex items-center">
                  Clients
                  {getSortIcon("clients")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  Created
                  {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium">No industries found</p>
                    <p className="text-xs">Try adjusting your filters or search terms</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((industry) => (
                <TableRow
                  key={industry.id}
                  className="cursor-pointer"
                  onClick={() => {
                    window.location.href = `/industries/${industry.id}`;
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(industry.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectOne(industry.id, e.target.checked);
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <SEOHealthGauge data={industry} config={industrySEOConfig} size="xs" />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/industries/${industry.id}`}
                      className="font-medium hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {industry.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">{industry.slug}</span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Badge variant="secondary">{industry._count.clients}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(industry.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IndustryRowActions industryId={industry.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{" "}
            {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
