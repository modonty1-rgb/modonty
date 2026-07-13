"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpDown, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MediaRow } from "../../../../actions/media-counts";

/**
 * The media segment list — the same dense table as the client, article and reference
 * segments: one line per row, colour carries status, 12px throughout, zebra striping.
 *
 * The thumbnail earns its column here and nowhere else: an image row without the image
 * is a filename, and you cannot write alt text for a filename.
 */

type SortKey = "filename" | "seoScore" | "createdAt";

/** Declared role at upload (MediaType enum) → what the admin reads. */
const TYPE_LABEL: Record<string, string> = {
  LOGO: "Logo",
  OGIMAGE: "OG image",
  TWITTER_IMAGE: "Twitter image",
  CLIENT_MINI: "Client mini",
  POST: "Post",
  GENERAL: "General",
};

/** Usage relations → where the image actually appears on the site. */
const USED_LABEL: Record<string, string> = {
  featured: "article cover",
  gallery: "article gallery",
  logo: "client logo",
  hero: "client hero",
};

function seoTone(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function MediaSegmentTable({ rows }: { rows: MediaRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("seoScore");
  const [asc, setAsc] = useState(true);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) => [r.filename, r.altText ?? ""].some((f) => f.toLowerCase().includes(q)))
      : rows;

    return [...filtered].sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (sort === "seoScore") return (a.seoScore - b.seoScore) * dir;
      if (sort === "createdAt") return a.createdAt.localeCompare(b.createdAt) * dir;
      return a.filename.localeCompare(b.filename) * dir;
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search filename or alt text…"
            className="h-8 ps-8 text-xs"
          />
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {visible.length === rows.length ? `${rows.length} files` : `${visible.length} of ${rows.length}`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 w-[52px] py-0" />
              <SortHead label="File" k="filename" />
              <TableHead className="h-9 py-0 text-xs">Type</TableHead>
              <TableHead className="h-9 py-0 text-xs">Alt text</TableHead>
              <TableHead className="h-9 py-0 text-xs">Size</TableHead>
              <SortHead label="SEO" k="seoScore" end />
              <TableHead className="h-9 py-0 text-xs">Used as</TableHead>
              <SortHead label="Added" k="createdAt" />
              <TableHead className="h-9 py-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="py-10 text-center text-xs text-muted-foreground">
                  {rows.length === 0
                    ? "Nothing is in this segment — that is good news."
                    : "No file matches that search."}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((r) => (
                <TableRow key={r.id} className="text-xs odd:bg-muted/40">
                  <TableCell className="py-1.5">
                    <div className="relative h-9 w-9 overflow-hidden rounded border bg-muted">
                      <Image
                        src={r.url}
                        alt={r.altText ?? ""}
                        fill
                        sizes="36px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[240px] py-2">
                    <span className="block truncate font-medium" title={r.filename}>
                      {r.filename}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2">
                    {/* What it was uploaded AS. "Used as" further right is where it actually appears. */}
                    <span className="text-muted-foreground">
                      {r.type ? (TYPE_LABEL[r.type] ?? r.type) : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[260px] py-2">
                    {r.altText?.trim() ? (
                      <span className="block truncate text-muted-foreground" title={r.altText}>
                        {r.altText}
                      </span>
                    ) : (
                      <span className="font-semibold text-red-600 dark:text-red-400">missing</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 tabular-nums" dir="ltr">
                    {r.width && r.height ? (
                      <span className="text-muted-foreground">
                        {r.width}×{r.height}
                      </span>
                    ) : (
                      <span className="font-semibold text-red-600 dark:text-red-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-end">
                    <span className={`font-bold tabular-nums ${seoTone(r.seoScore)}`}>{r.seoScore}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2">
                    {r.usedAs.length === 0 ? (
                      <span className="font-semibold text-red-600 dark:text-red-400">unused</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {r.usedAs.map((u) => USED_LABEL[u] ?? u).join(" · ")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 tabular-nums text-muted-foreground">
                    {r.createdAt.slice(0, 10)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 text-end">
                    <Link
                      href={`/media/${r.id}/edit`}
                      className="font-semibold text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
