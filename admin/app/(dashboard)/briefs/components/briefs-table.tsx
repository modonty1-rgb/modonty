"use client";

import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Building2, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { OpenClientConsoleButton } from "../../clients/components/edit-workspace/open-client-console-button";
import type { BriefRow } from "../helpers/load-briefs";

const PAGE_SIZE = 15;

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function BriefsTable({ rows }: { rows: BriefRow[] }) {
  const [query, setQuery] = useState("");
  const [thinOnly, setThinOnly] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q || r.name.toLowerCase().includes(q) || (r.industry ?? "").toLowerCase().includes(q);
      // "Thin" = under half answered. That is the practical line where a writer starts
      // guessing instead of writing.
      return matchesQuery && (!thinOnly || r.completeness < 50);
    });
  }, [rows, query, thinOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const thinCount = rows.filter((r) => r.completeness < 50).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[260px]">
          <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث باسم العميل أو المجال…"
            className="h-9 ps-8 text-sm"
          />
        </div>
        {thinCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setThinOnly((v) => !v);
              setPage(1);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors",
              thinOnly
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400",
            )}
            title="عملاء ما عبّوا نصف البيانات — الكاتب بيضطر يخمّن"
          >
            بياناتهم ناقصة
            <span className="font-bold tabular-nums">{thinCount}</span>
          </button>
        )}
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العميل</TableHead>
              <TableHead className="w-[170px]">المجال</TableHead>
              <TableHead className="w-[190px]">اكتمال البيانات</TableHead>
              <TableHead className="w-[120px] text-center" title="المنشور هذا الشهر مقابل حصّته">
                هذا الشهر
              </TableHead>
              <TableHead className="w-[130px]">آخر تحديث</TableHead>
              <TableHead className="w-[260px] text-end"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                لا يوجد عميل يطابق البحث.
              </TableCell>
            ) : (
              pageRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                        {r.logoUrl ? (
                          <OptimizedImage fill media={asMedia(r.logoUrl, "")} alt="" sizes="32px" className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                      <span className="truncate text-sm font-medium" title={r.name}>
                        {r.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">{r.industry ?? "—"}</TableCell>

                  <TableCell>
                    <Completeness value={r.completeness} answered={r.answered} total={r.totalQuestions} />
                  </TableCell>

                  <TableCell className="text-center text-sm tabular-nums">
                    {r.monthlyQuota > 0 ? (
                      <span
                        className={cn(
                          "font-semibold",
                          r.publishedThisMonth >= r.monthlyQuota
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {r.publishedThisMonth}/{r.monthlyQuota}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {r.intakeUpdatedAt ? (
                      dateFmt.format(new Date(r.intakeUpdatedAt))
                    ) : (
                      <span className="italic text-muted-foreground/60">ما عبّى بعد</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
                        <Link href={`/briefs/${r.id}`}>
                          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                          Brief
                        </Link>
                      </Button>
                      <OpenClientConsoleButton clientId={r.id} />
                    </div>
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
            صفحة {current} من {totalPages} · {filtered.length} عميل
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
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
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** The column a writer actually scans — bar + the raw fraction behind it. */
function Completeness({ value, answered, total }: { value: number; answered: number; total: number }) {
  const tone =
    value >= 80
      ? { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" }
      : value >= 50
        ? { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-500" }
        : { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" };

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${value}%` }} />
      </div>
      <span className={cn("text-xs font-bold tabular-nums", tone.text)}>{value}%</span>
      <span className="text-[10px] text-muted-foreground tabular-nums">
        {answered}/{total}
      </span>
    </div>
  );
}
