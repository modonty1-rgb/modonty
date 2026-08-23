"use client";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { ModontyPartnerMark } from "@modonty/shared/components/icons/modonty-partner-mark";

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
import type { GalleryClientRow } from "../helpers/load-galleries";

const PAGE_SIZE = 15;

export function GalleriesClientsTable({ clients }: { clients: GalleryClientRow[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? clients.filter((c) => c.name.toLowerCase().includes(q)) : clients;
  }, [clients, query]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="relative w-full max-w-[260px]">
        <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="ابحث عن عميل…"
          className="h-9 ps-8 text-sm"
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العميل</TableHead>
              <TableHead className="w-[140px]">عدد الصور</TableHead>
              <TableHead className="w-[160px] text-end"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                  لا يوجد عميل يطابق البحث.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                        {c.logoUrl ? (
                          <OptimizedImage fill media={asMedia(c.logoUrl, "")} alt="" sizes="32px" className="h-full w-full object-cover" />
                        ) : (
                          <ModontyPartnerMark className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="truncate text-sm font-medium" title={c.name}>
                        {c.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.count > 0 ? (
                      <span className="text-sm">
                        <span className="font-bold">{c.count}</span> صورة
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">— لا صور</span>
                    )}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
                      <Link href={`/client-galleries/${encodeURIComponent(c.id)}`}>
                        <Images className="h-3.5 w-3.5" />
                        إدارة المعرض
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
            <Button size="sm" variant="outline" className="h-7 gap-1" disabled={current <= 1} onClick={() => setPage(current - 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
              السابق
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1" disabled={current >= totalPages} onClick={() => setPage(current + 1)}>
              التالي
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
