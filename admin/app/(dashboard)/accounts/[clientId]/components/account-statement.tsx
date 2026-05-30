import { AlertTriangle, CheckCircle2, ReceiptText } from "lucide-react";

import { StatementEntryRow } from "./statement-entry-row";

// Presentational statement (Track A). Wire `entries` to the backend later;
// shape is intentionally backend-ready.
export type StatementEntryKind = "invoice" | "payment";

export interface StatementEntry {
  id: string;
  kind: StatementEntryKind;
  label: string;
  date: Date;
  amount: number; // positive number; sign/meaning derived from kind
  status: "PAID" | "DUE" | "OVERDUE" | "RECORDED";
  currency?: "SAR" | "EGP";
  // Extra invoice details surfaced in the dialog (optional for payments):
  invoiceNumber?: string;
  method?: string;
  periodLabel?: string;
  rangeStart?: Date;
  rangeEnd?: Date;
}

const riyal = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

export function AccountStatement({ entries, clientName }: { entries: StatementEntry[]; clientName: string }) {
  // ── Designed empty state (never dev-speak) ──────────────────────────
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20 px-4 py-12 text-center">
        <ReceiptText className="h-8 w-8 text-muted-foreground/60" />
        <p className="text-sm font-medium">لا توجد حركات بعد</p>
        <p className="text-xs text-muted-foreground">أصدر أول فاتورة لهذا العميل وستظهر هنا.</p>
      </div>
    );
  }

  // Ledger model: invoices add to what's owed; a PAID invoice (or a payment entry) settles it.
  const issued = entries.filter((e) => e.kind === "invoice").reduce((s, e) => s + e.amount, 0);
  const paid =
    entries.filter((e) => e.kind === "payment").reduce((s, e) => s + e.amount, 0) +
    entries.filter((e) => e.kind === "invoice" && e.status === "PAID").reduce((s, e) => s + e.amount, 0);
  const balance = entries
    .filter((e) => e.kind === "invoice" && e.status !== "PAID")
    .reduce((s, e) => s + e.amount, 0);
  const hasOverdue = entries.some((e) => e.kind === "invoice" && e.status === "OVERDUE");

  const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-5">
      {/* ── Smart alert (only when something needs attention) ── */}
      {balance > 0 && (
        <div
          className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 ${
            hasOverdue
              ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">
            {hasOverdue
              ? `مستحقّات متأخّرة بقيمة ${riyal.format(balance)} — تحتاج متابعة.`
              : `مبلغ مستحقّ بقيمة ${riyal.format(balance)} بانتظار السداد.`}
          </p>
        </div>
      )}

      {/* ── HERO: balance due (dominant focal point) + summary ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border bg-background p-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">الرصيد المستحقّ</p>
          {balance > 0 ? (
            <p className="text-3xl font-bold tabular-nums leading-none text-red-600 dark:text-red-400">
              {riyal.format(balance)}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-2xl font-bold leading-none text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
              مسدّد بالكامل
            </p>
          )}
        </div>
        <div className="flex gap-5 text-end">
          <Summary label="إجمالي مُصدَر" value={riyal.format(issued)} />
          <Summary label="إجمالي مدفوع" value={riyal.format(paid)} tone="text-emerald-600 dark:text-emerald-400" />
          <Summary label="الحركات" value={String(entries.length)} />
        </div>
      </div>

      {/* ── Timeline (click a row → details dialog) ── */}
      <ol className="relative space-y-1 ps-6">
        <span className="absolute inset-y-1 start-[11px] w-px bg-border" aria-hidden />
        {sorted.map((e) => (
          <StatementEntryRow key={e.id} entry={e} clientName={clientName} />
        ))}
      </ol>
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold tabular-nums mt-0.5 ${tone ?? ""}`}>{value}</p>
    </div>
  );
}
