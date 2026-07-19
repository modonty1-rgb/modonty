"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Wallet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface AccountRow {
  id: string;
  name: string;
  email: string;
  tier: string; // enum (BASIC/STANDARD/PRO/PREMIUM) — drives the plan chip tone
  planName: string; // real subscribed plan name (tier config) or enum fallback
  billing: string | null; // "monthly" | "annual" | null (from latest invoice)
  accountStatus: string;
  paymentStatus: string;
  subscribedDate: string | null; // subscriptionStartDate (display)
  subscribedTs: number | null; // raw ms — for chronological sort
  activationDate: string | null; // first PUBLISHED article — billing anchor (display)
  activationTs: number | null;
  endDate: string | null;
  endTs: number | null;
  daysLeft: number | null;
}

const ACCOUNT_TONE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  EXPIRED: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  CANCELLED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const PAYMENT_TONE: Record<string, string> = {
  PAID: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  OVERDUE: "bg-red-500/15 text-red-600 dark:text-red-400",
};

// Higher tiers get a violet accent so the premium plans stand out at a glance.
const PLAN_TONE: Record<string, string> = {
  PRO: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  PREMIUM: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
};

const PAGE_SIZE = 15;

type SortKey =
  | "name"
  | "plan"
  | "billing"
  | "account"
  | "payment"
  | "subscribed"
  | "activation"
  | "end";

const DATE_KEYS = new Set<SortKey>(["subscribed", "activation", "end"]);

function sortValue(r: AccountRow, key: SortKey): string | number | null {
  switch (key) {
    case "name": return r.name;
    case "plan": return r.planName;
    case "billing": return r.billing ?? "";
    case "account": return r.accountStatus;
    case "payment": return r.paymentStatus;
    case "subscribed": return r.subscribedTs;
    case "activation": return r.activationTs;
    case "end": return r.endTs;
  }
}

function Pill({ value, tone }: { value: string; tone?: string }) {
  return (
    <span
      className={cn(
        "inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium",
        tone || "bg-muted text-muted-foreground"
      )}
    >
      {value}
    </span>
  );
}

function BillingCell({ billing }: { billing: string | null }) {
  if (!billing) return <span className="text-muted-foreground">—</span>;
  const isAnnual = billing.toLowerCase() === "annual";
  return (
    <Pill
      value={isAnnual ? "Annual" : "Monthly"}
      tone={isAnnual ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground"}
    />
  );
}

export function AccountsTable({ rows }: { rows: AccountRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("subscribed");
  const [asc, setAsc] = useState(false); // default: newest subscription first
  const [page, setPage] = useState(1);

  const toggleSort = (k: SortKey) => {
    if (sort === k) {
      setAsc((v) => !v);
    } else {
      setSort(k);
      setAsc(true);
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  }, [query, rows]);

  const sorted = useMemo(() => {
    const dir = asc ? 1 : -1;
    const isDate = DATE_KEYS.has(sort);
    return [...filtered].sort((a, b) => {
      const av = sortValue(a, sort);
      const bv = sortValue(b, sort);
      if (isDate) {
        // nulls (no date) always sort last, regardless of direction
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        return ((av as number) - (bv as number)) * dir;
      }
      return String(av).localeCompare(String(bv), "ar") * dir;
    });
  }, [filtered, sort, asc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = sorted.slice(start, start + PAGE_SIZE);

  const SortHead = ({
    label,
    k,
    sub,
    align = "center",
  }: {
    label: string;
    k: SortKey;
    sub?: string;
    align?: "start" | "center" | "end";
  }) => {
    const active = sort === k;
    const Icon = active ? (asc ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <TableHead
        className={cn(
          "h-auto px-2 py-2 text-[11px] font-semibold text-muted-foreground bg-muted/40",
          align === "start" && "text-start ps-3",
          align === "center" && "text-center",
          align === "end" && "text-end pe-3"
        )}
      >
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={cn(
            "inline-flex items-center gap-1 leading-tight hover:text-foreground transition-colors",
            align === "center" && "mx-auto"
          )}
        >
          <span>
            {label}
            {sub && <span className="block text-[9px] font-normal opacity-70">{sub}</span>}
          </span>
          <Icon className={cn("h-3 w-3 shrink-0", active ? "text-foreground" : "opacity-40")} />
        </button>
      </TableHead>
    );
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-3 border-b flex items-center gap-2">
        <div className="relative max-w-sm w-full">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email…"
            aria-label="Search accounts by name or email"
            className="w-full h-9 rounded-md border bg-background ps-8 pe-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {sorted.length} account{sorted.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table
          className={cn(
            "whitespace-nowrap text-[13px]",
            // accounting-ledger grid: light vertical dividers between columns
            "[&_th]:border-e [&_td]:border-e [&_th:last-child]:border-e-0 [&_td:last-child]:border-e-0",
            "[&_th]:border-border/50 [&_td]:border-border/50"
          )}
        >
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHead label="Client" k="name" align="start" />
              <SortHead label="Plan" k="plan" />
              <SortHead label="Billing" k="billing" />
              <SortHead label="Account" k="account" />
              <SortHead label="Payment" k="payment" />
              <SortHead label="Subscribed" k="subscribed" />
              <SortHead label="Activation" k="activation" sub="first published" />
              <SortHead label="End" k="end" />
              <TableHead className="h-auto text-end font-semibold px-3 py-2 text-[11px] text-muted-foreground bg-muted/40">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&>tr:nth-child(even)]:bg-muted/20">
            {pageRows.map((r) => (
              <TableRow
                key={r.id}
                className={cn("hover:bg-muted/40", r.paymentStatus === "OVERDUE" && "bg-red-500/[0.05]")}
              >
                <TableCell className="px-3 py-1.5">
                  <div className="font-medium truncate max-w-[240px] leading-tight">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate max-w-[240px] leading-tight">{r.email}</div>
                </TableCell>
                <TableCell className="px-2 py-1.5 text-center">
                  <Pill value={r.planName} tone={PLAN_TONE[r.tier]} />
                </TableCell>
                <TableCell className="px-2 py-1.5 text-center">
                  <BillingCell billing={r.billing} />
                </TableCell>
                <TableCell className="px-2 py-1.5 text-center">
                  <Pill value={r.accountStatus} tone={ACCOUNT_TONE[r.accountStatus]} />
                </TableCell>
                <TableCell className="px-2 py-1.5 text-center">
                  <Pill value={r.paymentStatus} tone={PAYMENT_TONE[r.paymentStatus]} />
                </TableCell>
                <TableCell className="px-2 py-1.5 text-center text-muted-foreground tabular-nums">
                  {r.subscribedDate ?? "—"}
                </TableCell>
                <TableCell className="px-2 py-1.5 text-center tabular-nums">
                  {r.activationDate ? (
                    <span className="font-medium">{r.activationDate}</span>
                  ) : (
                    <Pill value="not activated" tone="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
                  )}
                </TableCell>
                <TableCell className="px-2 py-1.5 text-center tabular-nums">
                  {r.endDate ? (
                    <span className={r.daysLeft !== null && r.daysLeft < 0 ? "text-red-500" : "text-muted-foreground"}>
                      {r.endDate}
                      {r.daysLeft !== null && (
                        <span className="text-[10px] text-muted-foreground/70"> · {r.daysLeft < 0 ? "انتهى" : `${r.daysLeft}d`}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="px-3 py-1.5">
                  <div className="flex justify-end">
                    <Link
                      href={`/clients/${r.id}/account`}
                      aria-label={`Open account statement for ${r.name}`}
                      className="inline-flex items-center gap-1 h-6 px-2 rounded-md border text-[11px] font-medium hover:bg-muted/40 transition-colors"
                    >
                      <Receipt className="h-3 w-3" />
                      Statement
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sorted.length === 0 ? (
        <div className="px-4 py-10 text-center">
          {query ? (
            <p className="text-sm text-muted-foreground">No results for “{query}”.</p>
          ) : (
            <>
              <Wallet className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-semibold text-foreground">No accounts yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                فعّل أول عميل من صفحة العملاء وبيظهر حسابه هنا.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
          <span className="tabular-nums">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
              aria-label="Previous page"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border disabled:opacity-40 hover:bg-muted/40 transition-colors"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
            <span className="tabular-nums">
              Page {current} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current === totalPages}
              aria-label="Next page"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border disabled:opacity-40 hover:bg-muted/40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
