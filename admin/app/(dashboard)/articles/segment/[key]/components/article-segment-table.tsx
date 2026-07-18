"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GoogleIcon } from "@/components/admin/icons/google-icon";

/**
 * Article segment list — the same dense operational table as the client one:
 * one line per row, colour carries status, 12px throughout, zebra striping.
 */

export interface SegmentArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  clientName: string;
  categoryName: string | null;
  authorName: string | null;
  views: number;
  /** 0-100 from the shared dataLayer scorer — the published page, not the draft form. */
  seoScore: number;
  publishedAt: string | null;
  updatedAt: string;
}

type SortKey = "title" | "views" | "seoScore" | "publishedAt" | "updatedAt";

/** Red when someone is waiting on someone. Muted when it is just where it sits. */
const NEEDS_SOMEONE = new Set(["AWAITING_APPROVAL", "NEEDS_REVISION"]);

/** Google-ish bands: 90+ is fine, 70+ needs a look, below that it is failing. */
function seoTone(score: number): string {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function fmt(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "—";
}

export function ArticleSegmentTable({ articles }: { articles: SegmentArticle[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("updatedAt");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? articles.filter((a) =>
          [a.title, a.slug, a.clientName ?? "", a.categoryName ?? "", a.authorName ?? ""].some((f) =>
            f.toLowerCase().includes(q)
          )
        )
      : articles;

    return [...filtered].sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (sort === "views") return (a.views - b.views) * dir;
      if (sort === "seoScore") return (a.seoScore - b.seoScore) * dir;
      if (sort === "title") return a.title.localeCompare(b.title, "ar") * dir;
      // A missing date is not a low value — it sorts last either way.
      const av = a[sort] ?? "";
      const bv = b[sort] ?? "";
      if (!av) return 1;
      if (!bv) return -1;
      return av.localeCompare(bv) * dir;
    });
  }, [articles, query, sort, asc]);

  const toggle = (key: SortKey) => {
    if (sort === key) setAsc(!asc);
    else {
      setSort(key);
      setAsc(true);
    }
  };

  const SortHead = ({ label, k, end, title }: { label: ReactNode; k: SortKey; end?: boolean; title?: string }) => (
    <TableHead className={`h-9 py-0 text-xs ${end ? "text-end" : ""}`} title={title}>
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
            placeholder="Search title, slug, client, category…"
            className="h-8 ps-8 text-xs"
          />
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {rows.length === articles.length
            ? `${articles.length} article${articles.length === 1 ? "" : "s"}`
            : `${rows.length} of ${articles.length}`}
          <span className="ms-2 text-muted-foreground/60">
            SEO scored live · 90+ good · 70+ watch · below failing
          </span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHead label="Article" k="title" />
              <TableHead className="h-9 py-0 text-xs">Client</TableHead>
              <TableHead className="h-9 py-0 text-xs">Category</TableHead>
              <TableHead className="h-9 py-0 text-xs">Author</TableHead>
              <TableHead className="h-9 py-0 text-xs">Status</TableHead>
              <SortHead label={<GoogleIcon className="h-4 w-4" />} k="seoScore" end title="SEO Score" />
              <SortHead label="Views" k="views" end />
              <SortHead label="Published" k="publishedAt" />
              <SortHead label="Updated" k="updatedAt" />
              <TableHead className="h-9 py-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={10} className="py-10 text-center text-xs text-muted-foreground">
                  {articles.length === 0
                    ? "Nothing is in this segment."
                    : "No article matches that search."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((a) => {
                const blocked = NEEDS_SOMEONE.has(a.status);
                return (
                  <TableRow key={a.id} className="text-xs odd:bg-muted/40">
                    <TableCell className="max-w-[280px] py-2">
                      <span className="block truncate font-medium" title={a.title}>
                        {a.title}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[150px] py-2">
                      <span className="block truncate text-muted-foreground" title={a.clientName}>
                        {a.clientName}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[120px] py-2">
                      <span className="block truncate text-muted-foreground">
                        {a.categoryName ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[120px] py-2">
                      <span className="block truncate text-muted-foreground">
                        {a.authorName ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2">
                      <span
                        className={
                          blocked ? "font-semibold text-red-600 dark:text-red-400" : "text-muted-foreground"
                        }
                      >
                        {a.status.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-end">
                      <span className={`font-bold tabular-nums ${seoTone(a.seoScore)}`}>{a.seoScore}</span>
                    </TableCell>
                    <TableCell className="py-2 text-end font-semibold tabular-nums">
                      {a.views.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2 tabular-nums text-muted-foreground">
                      {fmt(a.publishedAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2 tabular-nums text-muted-foreground">
                      {fmt(a.updatedAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2 text-end">
                      <Link
                        href={`/articles/${a.id}/edit`}
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
