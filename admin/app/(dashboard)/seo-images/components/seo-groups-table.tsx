"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Images,
  Building2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { TypeCount } from "../helpers/load-groups";

export interface SeoGroupSummary {
  key: string;
  name: string;
  isModonty: boolean;
  count: number;
  avgScore: number;
  problems: number;
  typeCounts: TypeCount[];
}

type SortKey = "problems" | "name" | "count";
const PAGE_SIZE = 15;

export function SeoGroupsTable({ groups }: { groups: SeoGroupSummary[] }) {
  const [query, setQuery] = useState("");
  // Worst-first by default: clients with the most below-threshold images on top.
  const [sort, setSort] = useState<SortKey>("problems");
  const [asc, setAsc] = useState(false);
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? groups.filter((g) => g.name.toLowerCase().includes(q)) : groups;
    return [...filtered].sort((a, b) => {
      // Modonty bucket always last, out of the race.
      if (a.isModonty !== b.isModonty) return a.isModonty ? 1 : -1;
      const dir = asc ? 1 : -1;
      if (sort === "name") return a.name.localeCompare(b.name, "ar") * dir;
      if (sort === "count") return (a.count - b.count) * dir;
      return (a.problems - b.problems) * dir;
    });
  }, [groups, query, sort, asc]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggle = (key: SortKey) => {
    if (sort === key) setAsc(!asc);
    else {
      setSort(key);
      setAsc(key === "name");
    }
    setPage(1);
  };

  const SortHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead className="h-9 py-0 text-xs">
      <button
        type="button"
        onClick={() => toggle(k)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sort === k ? "text-foreground" : "opacity-30"}`} />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث باسم العميل…"
            className="h-8 ps-8 text-xs"
          />
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {rows.length === groups.length ? `${groups.length} مجموعة` : `${rows.length} من ${groups.length}`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHead label="العميل" k="name" />
              <SortHead label="الصور" k="count" />
              <TableHead className="h-9 py-0 text-xs">الأنواع</TableHead>
              <SortHead label="الحالة" k="problems" />
              <TableHead className="h-9 py-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                  {groups.length === 0 ? "لا توجد صور بعد." : "لا يوجد عميل يطابق البحث."}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((g) => (
                <TableRow key={g.key} className="text-xs odd:bg-muted/40">
                  <TableCell className="max-w-[320px] py-2">
                    <Link
                      href={`/seo-images/${encodeURIComponent(g.key)}`}
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      {g.isModonty ? (
                        <Images className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate font-medium" title={g.name}>
                        {g.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 text-muted-foreground">{g.count}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {g.typeCounts.map((t) => (
                        <span
                          key={t.type}
                          className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground"
                        >
                          {t.type}
                          <span className="text-foreground">{t.count}</span>
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2">
                    {g.problems > 0 ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-500">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {g.problems} {g.problems === 1 ? "مشكلة" : "مشاكل"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        مكتملة
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-end">
                    <Button asChild size="sm" variant="outline" className="h-7 gap-1.5">
                      <Link href={`/seo-images/${encodeURIComponent(g.key)}`}>
                        تحسين الصور
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">
            صفحة {current} من {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              السابق
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
            >
              التالي
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
