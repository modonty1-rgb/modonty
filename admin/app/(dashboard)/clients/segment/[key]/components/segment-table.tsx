"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * The segment list. A dense operational table, not a card wall (Khalid 2026-07-13:
 * the first pass had three-line rows and stacked badges — unreadable).
 *
 * Rules that keep it that way:
 *   · one line per row — every cell truncates, nothing wraps
 *   · colour carries status, not pills: red when it costs you, muted when it is a fact
 *   · 12px text throughout; the eye scans columns, it does not read paragraphs
 */

export interface SegmentClient {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  ctaMode: string | null;
  isYmyl: boolean;
  subscriptionStatus: string;
  paymentStatus: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  articleCount: number;
  /** 0-100 from the shared dataLayer client scorer — same number as the clients table. */
  seoScore: number;
  /** Which of logo · hero · share image are absent. Empty = all three are there. */
  missingImages: string[];
}

type SortKey = "name" | "articleCount" | "seoScore" | "subscriptionStartDate" | "subscriptionEndDate";

const CTA_LABEL: Record<string, string> = {
  FORM: "Booking form",
  LINK: "External link",
  NONE: "No button",
};

const BAD = new Set(["EXPIRED", "OVERDUE", "CANCELLED"]);

/** Same bands as the clients table: 80+ good, 60+ watch, below failing. */
function seoTone(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function fmt(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "—";
}

export function SegmentTable({ clients }: { clients: SegmentClient[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? clients.filter((c) =>
          [c.name, c.slug, c.email, c.phone ?? ""].some((f) => f.toLowerCase().includes(q))
        )
      : clients;

    return [...filtered].sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (sort === "articleCount") return (a.articleCount - b.articleCount) * dir;
      if (sort === "seoScore") return (a.seoScore - b.seoScore) * dir;
      if (sort === "name") return a.name.localeCompare(b.name, "ar") * dir;
      // Missing dates sort last in both directions — an empty cell is not a low value.
      const av = a[sort] ?? "";
      const bv = b[sort] ?? "";
      if (!av) return 1;
      if (!bv) return -1;
      return av.localeCompare(bv) * dir;
    });
  }, [clients, query, sort, asc]);

  const toggle = (key: SortKey) => {
    if (sort === key) setAsc(!asc);
    else {
      setSort(key);
      setAsc(true);
    }
  };

  const SortHead = ({ label, k, end }: { label: string; k: SortKey; end?: boolean }) => (
    <TableHead className={`h-9 py-0 text-xs ${end ? "text-end" : ""}`}>
      <button
        type="button"
        onClick={() => toggle(k)}
        className={`inline-flex items-center gap-1 hover:text-foreground ${end ? "justify-end" : ""}`}
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
            placeholder="Search name, slug, email or phone…"
            className="h-8 ps-8 text-xs"
          />
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {rows.length === clients.length
            ? `${clients.length} client${clients.length === 1 ? "" : "s"}`
            : `${rows.length} of ${clients.length}`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHead label="Client" k="name" />
              <TableHead className="h-9 py-0 text-xs">Phone</TableHead>
              <TableHead className="h-9 py-0 text-xs">Email</TableHead>
              <TableHead className="h-9 py-0 text-xs">Reach</TableHead>
              <TableHead className="h-9 py-0 text-xs">Missing images</TableHead>
              <SortHead label="SEO" k="seoScore" end />
              <SortHead label="Articles" k="articleCount" end />
              <TableHead className="h-9 py-0 text-xs">Status</TableHead>
              <SortHead label="Started" k="subscriptionStartDate" />
              <SortHead label="Ends" k="subscriptionEndDate" />
              <TableHead className="h-9 py-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={11} className="py-10 text-center text-xs text-muted-foreground">
                  {clients.length === 0
                    ? "Nobody is in this segment — that is good news."
                    : "No client matches that search."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => {
                // "No button" and "never set" are different problems — both are red,
                // but the label has to say which one you are looking at.
                const noReach = !c.ctaMode || c.ctaMode === "NONE";
                const reach = c.ctaMode ? (CTA_LABEL[c.ctaMode] ?? c.ctaMode) : "Never set";
                const subBad = BAD.has(c.subscriptionStatus);
                const payBad = BAD.has(c.paymentStatus);
                return (
                  // Zebra striping: at this row density the eye loses its line otherwise.
                  <TableRow key={c.id} className="text-xs odd:bg-muted/40">
                    <TableCell className="max-w-[220px] py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-medium" title={c.name}>
                          {c.name}
                        </span>
                        {c.isYmyl && (
                          <span className="shrink-0 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                            YMYL
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2 tabular-nums" dir="ltr">
                      {c.phone ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] py-2">
                      <span className="block truncate text-muted-foreground" title={c.email}>
                        {c.email}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2">
                      <span
                        className={
                          noReach ? "font-semibold text-red-600 dark:text-red-400" : "text-muted-foreground"
                        }
                      >
                        {reach}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2">
                      {c.missingImages.length === 0 ? (
                        <span className="text-muted-foreground/40">—</span>
                      ) : (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {c.missingImages.join(" · ")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-end">
                      <span className={`font-bold tabular-nums ${seoTone(c.seoScore)}`}>{c.seoScore}</span>
                    </TableCell>
                    <TableCell className="py-2 text-end font-semibold tabular-nums">
                      {c.articleCount}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2">
                      <span className={subBad ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                        {c.subscriptionStatus.toLowerCase()}
                      </span>
                      <span className="text-muted-foreground/40"> · </span>
                      <span
                        className={
                          payBad ? "font-semibold text-red-600 dark:text-red-400" : "text-muted-foreground"
                        }
                      >
                        {c.paymentStatus.toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2 tabular-nums text-muted-foreground">
                      {fmt(c.subscriptionStartDate)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2 tabular-nums text-muted-foreground">
                      {fmt(c.subscriptionEndDate)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2 text-end">
                      <Link
                        href={`/clients/${c.id}/edit`}
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
