"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReferenceRow } from "../../../../actions/reference-seo-counts";

/**
 * Reference rows — the same dense table as the client and article segments:
 * one line per row, colour carries status, 12px throughout, zebra striping.
 *
 * The extra column here is "Generated": a 0 because nothing was ever generated is a
 * different job from a 0 because what was generated is bad, and the fix is different.
 */

type SortKey = "name" | "seoScore";

function seoTone(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function ReferenceTable({
  rows,
  editBase,
  editMode,
}: {
  rows: ReferenceRow[];
  editBase: string;
  /** "single": the whole group is managed on one page (authors) — no per-id route. */
  editMode: "perId" | "single";
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("seoScore");
  const [asc, setAsc] = useState(true);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) => [r.name, r.slug].some((f) => f.toLowerCase().includes(q)))
      : rows;

    return [...filtered].sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (sort === "seoScore") return (a.seoScore - b.seoScore) * dir;
      return a.name.localeCompare(b.name, "ar") * dir;
    });
  }, [rows, query, sort, asc]);

  const toggle = (k: SortKey) => {
    if (sort === k) setAsc(!asc);
    else {
      setSort(k);
      setAsc(true);
    }
  };

  const SortHead = ({ label, k, end }: { label: string; k: SortKey; end?: boolean }) => (
    <TableHead className={`h-9 py-0 text-xs ${end ? "text-end" : ""}`}>
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

  const failing = rows.filter((r) => r.seoScore < 60).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or slug…"
            className="h-8 ps-8 text-xs"
          />
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {visible.length === rows.length ? `${rows.length} pages` : `${visible.length} of ${rows.length}`}
          {failing > 0 && (
            <span className="ms-2 font-semibold text-red-600 dark:text-red-400">
              {failing} below 60
            </span>
          )}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHead label="Name" k="name" />
              <TableHead className="h-9 py-0 text-xs">Slug</TableHead>
              <SortHead label="SEO" k="seoScore" end />
              <TableHead className="h-9 py-0 text-xs">Generated</TableHead>
              <TableHead className="h-9 py-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                  {rows.length === 0 ? "Nothing here yet." : "No page matches that search."}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((r) => {
                const nothingGenerated = !r.hasMetadata && !r.hasJsonLd;
                return (
                  <TableRow key={r.id} className="text-xs odd:bg-muted/40">
                    <TableCell className="max-w-[280px] py-2">
                      <span className="block truncate font-medium" title={r.name}>
                        {r.name}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[220px] py-2">
                      <span className="block truncate text-muted-foreground" title={r.slug}>
                        {r.slug}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-end">
                      <span className={`font-bold tabular-nums ${seoTone(r.seoScore)}`}>
                        {r.seoScore}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2">
                      {nothingGenerated ? (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          nothing generated
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {r.hasMetadata ? "meta" : "no meta"}
                          <span className="text-muted-foreground/40"> · </span>
                          {r.hasJsonLd ? "json-ld" : "no json-ld"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2 text-end">
                      <Link
                        href={editMode === "single" ? editBase : `${editBase}/${r.id}/edit`}
                        className="font-semibold text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
