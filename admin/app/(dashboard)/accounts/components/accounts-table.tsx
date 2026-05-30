"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft } from "lucide-react";

export interface AccountRow {
  id: string;
  name: string;
  email: string;
  tier: string;
  accountStatus: string;
  paymentStatus: string;
  startDate: string | null;
  endDate: string | null;
  daysLeft: number | null;
  articlesPerMonth: number;
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

function Pill({ value, tone }: { value: string; tone: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${tone || "bg-muted text-muted-foreground"}`}>
      {value}
    </span>
  );
}

export function AccountsTable({ rows }: { rows: AccountRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  }, [query, rows]);

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-3 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث بالاسم أو الإيميل…"
            className="w-full h-9 rounded-md border bg-background ps-8 pe-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="text-start font-medium px-4 py-2.5">Client</th>
              <th className="text-center font-medium px-2 py-2.5">Plan</th>
              <th className="text-center font-medium px-2 py-2.5">Account</th>
              <th className="text-center font-medium px-2 py-2.5">Payment</th>
              <th className="text-center font-medium px-2 py-2.5">Start</th>
              <th className="text-center font-medium px-2 py-2.5">End</th>
              <th className="text-end font-medium px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium truncate max-w-[200px]">{r.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">{r.email}</div>
                </td>
                <td className="px-2 py-3 text-center">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted-foreground/15 font-medium">
                    {r.tier}
                  </span>
                </td>
                <td className="px-2 py-3 text-center">
                  <Pill value={r.accountStatus} tone={ACCOUNT_TONE[r.accountStatus]} />
                </td>
                <td className="px-2 py-3 text-center">
                  <Pill value={r.paymentStatus} tone={PAYMENT_TONE[r.paymentStatus]} />
                </td>
                <td className="px-2 py-3 text-center text-xs text-muted-foreground tabular-nums">
                  {r.startDate ?? "—"}
                </td>
                <td className="px-2 py-3 text-center text-xs tabular-nums">
                  {r.endDate ? (
                    <span className={r.daysLeft !== null && r.daysLeft < 0 ? "text-red-500" : "text-muted-foreground"}>
                      {r.endDate}
                      {r.daysLeft !== null && (
                        <span className="block text-[10px]">
                          {r.daysLeft < 0 ? `انتهى` : `${r.daysLeft}d`}
                        </span>
                      )}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <Link
                      href={`/accounts/${r.id}`}
                      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border text-[11px] font-medium hover:bg-muted/40 transition-colors"
                    >
                      فتح الحساب
                      <ChevronLeft className="h-3 w-3" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          {query ? "لا توجد نتائج للبحث." : "لا يوجد عملاء بعد."}
        </div>
      )}
    </div>
  );
}
