"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

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
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { ClientSeoDialog } from "./client-seo-dialog";

export interface SeoClientRow {
  id: string;
  name: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  score: number;
  industryName: string | null;
  businessBrief: string | null;
  addressCity: string | null;
  isYmyl: string | null;
}

type SortKey = "score" | "name";
const PAGE_SIZE = 15;

function missingHint(c: SeoClientRow): string {
  const noTitle = !c.seoTitle?.trim();
  const noDesc = !c.seoDescription?.trim();
  if (noTitle && noDesc) return "ناقص: العنوان + الوصف";
  if (noDesc) return "ناقص: الوصف";
  if (noTitle) return "ناقص: العنوان";
  return c.score >= 90 ? "مكتمل" : "يحتاج تحسين";
}

export function SeoClientList({ clients }: { clients: SeoClientRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // Worst-first by default — this page exists to find the clients that need a writer.
  const [sort, setSort] = useState<SortKey>("score");
  const [asc, setAsc] = useState(true);
  const [page, setPage] = useState(1);

  const active = clients.find((c) => c.id === openId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? clients.filter((c) =>
          [c.name, c.industryName ?? "", c.addressCity ?? ""].some((f) => f.toLowerCase().includes(q)),
        )
      : clients;
    return [...filtered].sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (sort === "name") return a.name.localeCompare(b.name, "ar") * dir;
      return (a.score - b.score) * dir;
    });
  }, [clients, query, sort, asc]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggle = (key: SortKey) => {
    if (sort === key) setAsc(!asc);
    else {
      setSort(key);
      setAsc(key === "score");
    }
    setPage(1);
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
      {/* Toolbar: search + count */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث باسم العميل أو المجال أو المدينة…"
            className="h-8 ps-8 text-xs"
          />
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {rows.length === clients.length ? `${clients.length} عميل` : `${rows.length} من ${clients.length}`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHead label="SEO" k="score" />
              <SortHead label="العميل" k="name" />
              <TableHead className="h-9 py-0 text-xs">الحالة</TableHead>
              <TableHead className="h-9 py-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-10 text-center text-xs text-muted-foreground">
                  {clients.length === 0 ? "لا يوجد عملاء بعد." : "لا يوجد عميل يطابق البحث."}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((c) => (
                <TableRow key={c.id} className="text-xs odd:bg-muted/40">
                  <TableCell className="py-2">
                    <SeoScoreBadge score={c.score} size="sm" href={`/clients/${c.id}/seo-technical`} />
                  </TableCell>
                  <TableCell className="max-w-[320px] py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium" title={c.name}>
                        {c.name}
                      </span>
                      {c.isYmyl && (
                        <span className="shrink-0 text-[9px] font-bold text-amber-600 dark:text-amber-400">YMYL</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 text-muted-foreground">
                    {missingHint(c)}
                  </TableCell>
                  <TableCell className="py-2 text-end">
                    <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => setOpenId(c.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                      تعديل
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">صفحة {current} من {totalPages}</span>
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

      <ClientSeoDialog
        client={active}
        open={Boolean(active)}
        onOpenChange={(o) => {
          if (!o) setOpenId(null);
        }}
      />
    </div>
  );
}
