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
 * The billing view of a segment. Same dense one-line-per-row rules as SegmentTable, but
 * the columns answer the money question — how much is owed, over how many invoices, and
 * when the subscription ends — instead of SEO/reach, which belong to a different table
 * entirely (Khalid 2026-07-24: «الجدول لا يخص الحسابات، اعرض ما يخص الفاتورة»).
 *
 * Every row's action is «Statement» → the client account page, where the invoice is
 * actually settled or archived.
 */

export interface MoneySegmentClient {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  isYmyl: boolean;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
  unpaidCount: number;
  unpaidAmount: number;
  currency: string | null;
}

type SortKey = "name" | "unpaid" | "amount" | "ends";

function fmtDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "—";
}

function money(amount: number, currency: string | null): string {
  if (!currency || amount <= 0) return "—";
  return `${new Intl.NumberFormat("en-US").format(amount)} ${currency}`;
}

function isExpired(iso: string | null): boolean {
  return iso ? new Date(iso).getTime() < Date.now() : false;
}

export function MoneySegmentTable({ clients }: { clients: MoneySegmentClient[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("amount");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? clients.filter((c) =>
          [c.name, c.email, c.phone ?? ""].some((f) => f.toLowerCase().includes(q))
        )
      : clients;

    const dir = asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "unpaid":
          return (a.unpaidCount - b.unpaidCount) * dir;
        case "amount":
          return (a.unpaidAmount - b.unpaidAmount) * dir;
        case "ends":
          return (
            ((a.subscriptionEndDate ?? "").localeCompare(b.subscriptionEndDate ?? "")) * dir
          );
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });
  }, [clients, query, sort, asc]);

  const toggle = (k: SortKey) => {
    if (sort === k) setAsc((v) => !v);
    else {
      setSort(k);
      setAsc(false);
    }
  };

  const SortHead = ({ label, k, end }: { label: string; k: SortKey; end?: boolean }) => (
    <TableHead className="h-9 py-0 text-xs">
      <button
        type="button"
        onClick={() => toggle(k)}
        className={`inline-flex items-center gap-1 hover:text-foreground ${end ? "justify-end" : ""}`}
      >
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or phone…"
            className="h-9 ps-8 text-sm"
          />
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? "client" : "clients"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="[&>th]:whitespace-nowrap">
              <SortHead label="Client" k="name" />
              <SortHead label="Unpaid" k="unpaid" />
              <SortHead label="Amount owed" k="amount" />
              <TableHead className="h-9 py-0 text-xs">Status</TableHead>
              <SortHead label="Ends" k="ends" />
              <TableHead className="h-9 py-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Nobody is in this segment — that is good news.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => {
                const expired = isExpired(c.subscriptionEndDate);
                return (
                  <TableRow key={c.id} className="text-[13px]">
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.name}</span>
                        {c.isYmyl && (
                          <span className="rounded bg-amber-500/15 px-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            YMYL
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{c.phone ?? c.email}</span>
                    </TableCell>
                    <TableCell className="py-2 tabular-nums">
                      {c.unpaidCount > 0 ? (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {c.unpaidCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 tabular-nums font-semibold">
                      <span className={c.unpaidAmount > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                        {money(c.unpaidAmount, c.currency)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-muted-foreground">{c.subscriptionStatus.toLowerCase()}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2 tabular-nums">
                      <span className={expired ? "font-semibold text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                        {fmtDate(c.subscriptionEndDate)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-end">
                      <Link
                        href={`/clients/${c.id}/account`}
                        className="font-semibold text-primary hover:underline"
                      >
                        Statement
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
