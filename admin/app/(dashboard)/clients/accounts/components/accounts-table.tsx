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
  CheckCircle2,
  PauseCircle,
  FileClock,
  AlertTriangle,
  CalendarClock,
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
  /** Counted from the client's invoices — the stored paymentStatus never says OVERDUE. */
  unpaidCount: number;
  unpaidAmount: number;
  unpaidCurrency: string | null;
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

/**
 * The KPI row doubles as the filter. One definition per key drives BOTH the number on
 * the card and the rows the table shows, so a card can never advertise a count the
 * table then contradicts. Clicking the active card returns to «الكل».
 */
export type KpiKey = "total" | "active" | "inactive" | "notActivated" | "unpaid" | "expiring";

const kpiTests = (expiringWindow: number): Record<KpiKey, (r: AccountRow) => boolean> => ({
  total: () => true,
  active: (r) => r.accountStatus === "ACTIVE",
  inactive: (r) => r.accountStatus !== "ACTIVE",
  notActivated: (r) => r.activationTs === null,
  unpaid: (r) => r.unpaidCount > 0,
  // Already-expired counts too: a lapsed account is the most urgent renewal there is,
  // and leaving it out of every card is how it stays invisible.
  expiring: (r) => r.daysLeft !== null && r.daysLeft <= expiringWindow,
});

/**
 * One colour per state, defined once. The icon chip, the toggle ring and the row tint
 * all read from here, so «قرب الانتهاء» is the same violet everywhere it appears —
 * the colour becomes the meaning instead of decoration (Khalid 2026-07-24).
 */
const KPI_META: { key: KpiKey; label: string; tone: string; ring: string; row: string }[] = [
  { key: "total", label: "إجمالي الحسابات", tone: "bg-muted text-foreground", ring: "ring-foreground/40", row: "" },
  { key: "active", label: "نشط", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500", row: "border-s-emerald-500 bg-emerald-500/[0.04]" },
  { key: "inactive", label: "غير نشط", tone: "bg-slate-500/15 text-slate-600 dark:text-slate-400", ring: "ring-slate-500", row: "border-s-slate-500 bg-slate-500/[0.06]" },
  { key: "notActivated", label: "بلا مقال منشور", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400", ring: "ring-amber-500", row: "border-s-amber-500 bg-amber-500/[0.06]" },
  { key: "unpaid", label: "عليه مستحقات", tone: "bg-red-500/15 text-red-600 dark:text-red-400", ring: "ring-red-500", row: "border-s-red-500 bg-red-500/[0.07]" },
  { key: "expiring", label: "قرب الانتهاء · ٧ أيام", tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400", ring: "ring-violet-500", row: "border-s-violet-500 bg-violet-500/[0.06]" },
];

const ROW_TINT = Object.fromEntries(KPI_META.map((m) => [m.key, m.row])) as Record<KpiKey, string>;

/**
 * Which state colours a row. Ordered by what the admin must act on first: money owed,
 * then a lapsed/imminent renewal, then a client sitting unactivated. A healthy account
 * stays plain — colour has to mean «look here», or it means nothing.
 */
function rowState(r: AccountRow, expiringWindow: number): KpiKey | null {
  if (r.unpaidCount > 0) return "unpaid";
  if (r.daysLeft !== null && r.daysLeft <= expiringWindow) return "expiring"; // includes expired
  if (r.activationTs === null) return "notActivated";
  if (r.accountStatus !== "ACTIVE") return "inactive";
  return null;
}

const KPI_ICONS: Record<KpiKey, React.ComponentType<{ className?: string }>> = {
  total: Wallet,
  active: CheckCircle2,
  inactive: PauseCircle,
  notActivated: FileClock,
  unpaid: AlertTriangle,
  expiring: CalendarClock,
};

function KpiToggle({
  meta,
  value,
  active,
  onClick,
  icon: Icon,
  trailing,
}: {
  meta: (typeof KPI_META)[number];
  value: number;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  /** Rendered beside the toggle, never inside it — a button cannot nest a button. */
  trailing?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card px-2.5 py-2 transition-all",
        active && `ring-2 ${meta.ring} border-transparent`,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        title={`${meta.label} — اضغط للتصفية`}
        className="flex min-w-0 flex-1 items-center gap-2 text-start transition-transform active:scale-[0.98]"
      >
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded", meta.tone)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-base font-bold tabular-nums leading-none">{value}</span>
        <span className="truncate text-[11px] leading-tight text-muted-foreground">{meta.label}</span>
      </button>
      {trailing}
    </div>
  );
}

/**
 * A renewal is «قريب» when 7 days or fewer remain — expired included, since a lapsed
 * account is the most urgent renewal of all. The window is spelled out on the card:
 * a threshold the admin cannot see is a number they cannot trust (Khalid 2026-07-24).
 * Moves to a shared Settings value later — see TODO.
 */
const EXPIRING_WINDOW_DAYS = 7;

export function AccountsTable({ rows }: { rows: AccountRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("subscribed");
  const [asc, setAsc] = useState(false); // default: newest subscription first
  const [page, setPage] = useState(1);
  const [kpi, setKpi] = useState<KpiKey>("total");
  const TESTS = useMemo(() => kpiTests(EXPIRING_WINDOW_DAYS), []);

  const toggleSort = (k: SortKey) => {
    if (sort === k) {
      setAsc((v) => !v);
    } else {
      setSort(k);
      setAsc(true);
    }
    setPage(1);
  };

  /** Clicking the same card again clears it — a toggle, not a one-way trip. */
  const pickKpi = (k: KpiKey) => {
    setKpi((cur) => (cur === k ? "total" : k));
    setPage(1);
  };

  // Invoice-level detail for the banner (the cards deliberately count accounts).
  const unpaidInvoices = rows.reduce((s, r) => s + r.unpaidCount, 0);
  const unpaidClients = rows.filter((r) => r.unpaidCount > 0).length;
  const unpaidTotals = useMemo(() => {
    const byCurrency = new Map<string, number>();
    for (const r of rows) {
      if (!r.unpaidCount || !r.unpaidCurrency) continue;
      byCurrency.set(r.unpaidCurrency, (byCurrency.get(r.unpaidCurrency) ?? 0) + r.unpaidAmount);
    }
    return [...byCurrency.entries()]
      .map(([cur, amt]) => `${new Intl.NumberFormat("en-US").format(amt)} ${cur}`)
      .join(" · ");
  }, [rows]);

  const counts = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => TESTS.active(r)).length,
      inactive: rows.filter((r) => TESTS.inactive(r)).length,
      notActivated: rows.filter((r) => TESTS.notActivated(r)).length,
      // ACCOUNTS, like every other card — they all have to be slices of the same 27,
      // or the row stops adding up. How many invoices and how much money is owed lives
      // in the red banner and in the row itself, where the detail belongs.
      unpaid: rows.filter((r) => TESTS.unpaid(r)).length,
      expiring: rows.filter((r) => TESTS.expiring(r)).length,
    }),
    [rows, TESTS],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byKpi = rows.filter(TESTS[kpi]);
    if (!q) return byKpi;
    return byKpi.filter(
      (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  }, [query, rows, kpi, TESTS]);

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
    <div className="space-y-3">
      {/* Filters live on the numbers themselves, directly above the rows they change —
          no navigation, no scroll jump (the lesson from OBS-051). */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {KPI_META.map((meta) => (
          <KpiToggle
            key={meta.key}
            meta={meta}
            value={counts[meta.key]}
            active={kpi === meta.key}
            onClick={() => pickKpi(meta.key)}
            icon={KPI_ICONS[meta.key]}
          />
        ))}
      </div>

      {/* Sits BELOW the cards on purpose: its «3» counts invoices while every card
          counts accounts, and above them the two numbers read as one series. */}
      {unpaidInvoices > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-500/15 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
          </span>

          {/* The MONEY is the headline — it is the thing that is actually at risk. */}
          <div className="leading-tight">
            <p className="text-lg font-bold tabular-nums text-red-700 dark:text-red-400">
              {unpaidTotals || "—"}
            </p>
            <p className="text-[11px] text-red-600/80 dark:text-red-400/70">مستحقّات غير محصّلة</p>
          </div>

          <span className="h-8 w-px bg-red-500/25" aria-hidden="true" />

          {/* Counts kept as their own chips so «3 فواتير» can never be misread as money. */}
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-red-500/15 px-2 py-1 text-[12px] font-semibold text-red-700 dark:text-red-400">
              <span className="tabular-nums">{unpaidInvoices}</span> فاتورة
            </span>
            <span className="rounded-md bg-red-500/10 px-2 py-1 text-[12px] font-medium text-red-600/90 dark:text-red-400/90">
              <span className="tabular-nums">{unpaidClients}</span>{" "}
              {unpaidClients === 1 ? "حساب" : "حسابات"}
            </span>
          </div>

          <p className="text-[11px] text-red-600/70 dark:text-red-400/60 ms-auto">
            راجعها وأرسل تذكير الدفع.
          </p>
        </div>
      )}

      <div className="rounded-lg border bg-card">
      <div className="p-3 border-b flex flex-wrap items-center gap-2">
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
        {kpi !== "total" && (
          <button
            type="button"
            onClick={() => pickKpi("total")}
            className="ms-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            {KPI_META.find((m) => m.key === kpi)?.label}
            <span aria-hidden="true">✕</span>
          </button>
        )}
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
              {/* Named after the fact it shows, not after «activation» — that word sits
                  next to the ACTIVE/inactive account column and read as if the account
                  itself were disabled (Khalid 2026-07-24). */}
              <SortHead label="First article" k="activation" sub="billing starts here" />
              <SortHead label="End" k="end" />
              <TableHead className="h-auto text-end font-semibold px-3 py-2 text-[11px] text-muted-foreground bg-muted/40">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&>tr:nth-child(even)]:bg-muted/20">
            {pageRows.map((r) => (
              /* The WHOLE row carries its state, tinted in the SAME colour as that
                 state's toggle icon — so the violet row is visibly the «قرب الانتهاء»
                 row without reading a single cell. An account has to be findable by
                 glance while scanning 27 of them.
                 (The old `paymentStatus === "OVERDUE"` tint never fired — nothing ever
                 writes OVERDUE to that field; see the KPI note in TODO.) */
              <TableRow
                key={r.id}
                className={cn(
                  "hover:bg-muted/40 border-s-2 border-s-transparent",
                  ROW_TINT[rowState(r, EXPIRING_WINDOW_DAYS) ?? "total"],
                )}
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
                  {/* What is actually owed beats the stored flag — that flag says PAID
                      even with three invoices outstanding, so the invoices speak first. */}
                  {r.unpaidCount > 0 ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-red-600 dark:text-red-400"
                      title={`${r.unpaidCount} فاتورة غير مدفوعة`}
                    >
                      {r.unpaidCount} غير مدفوعة
                      {r.unpaidCurrency && (
                        <span className="text-[10px] font-medium opacity-80">
                          · {new Intl.NumberFormat("en-US").format(r.unpaidAmount)} {r.unpaidCurrency}
                        </span>
                      )}
                    </span>
                  ) : (
                    <Pill value={r.paymentStatus} tone={PAYMENT_TONE[r.paymentStatus]} />
                  )}
                </TableCell>
                <TableCell className="px-2 py-1.5 text-center text-muted-foreground tabular-nums">
                  {r.subscribedDate ?? "—"}
                </TableCell>
                <TableCell className="px-2 py-1.5 text-center tabular-nums">
                  {r.activationDate ? (
                    <span className="font-medium">{r.activationDate}</span>
                  ) : (
                    <Pill value="no article yet" tone="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
                  )}
                </TableCell>
                <TableCell className="px-2 py-1.5 text-center tabular-nums">
                  {r.endDate ? (
                    /* Same palette and the same 7-day line as the toggle, so a violet
                       date always means the violet card counted it. */
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium",
                        r.daysLeft === null
                          ? "text-muted-foreground"
                          : r.daysLeft <= EXPIRING_WINDOW_DAYS
                            ? "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      {r.endDate}
                      {r.daysLeft !== null && (
                        <span className="text-[10px] opacity-80"> · {r.daysLeft < 0 ? "انتهى" : `${r.daysLeft}d`}</span>
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
    </div>
  );
}
