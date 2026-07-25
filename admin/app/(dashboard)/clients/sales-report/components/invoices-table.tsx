"use client";

import { DataTable, type Column } from "@/components/admin/data-table";
import type { RecentInvoice } from "../actions/get-sales-report";

const nf = new Intl.NumberFormat("en-US");

// Same currency hues used across the report: SAR emerald · EGP blue.
function AmountBadge({ code, value }: { code: string; value: number }) {
  const cls =
    code === "EGP"
      ? "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:text-blue-400"
      : "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ring-1 ring-inset ${cls}`}>
      <span className="text-[9px] font-semibold opacity-70">{code}</span>
      {nf.format(Math.round(value))}
    </span>
  );
}

const COLUMNS: Column<RecentInvoice>[] = [
  { key: "number", header: "الفاتورة", render: (i) => <span className="font-mono text-xs text-muted-foreground">{i.number}</span> },
  {
    key: "clientName",
    header: "العميل",
    render: (i) => (
      <span className="inline-flex flex-wrap items-center gap-2 font-semibold">
        {i.clientName}
        {i.fromOpeningBalance && (
          <span
            title="فاتورة تمثّل الرصيد الافتتاحي — لا تُحتسب كإيراد جديد"
            className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-600 ring-1 ring-inset ring-sky-500/20 dark:text-sky-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            رصيد افتتاحي
          </span>
        )}
      </span>
    ),
  },
  { key: "tierName", header: "الباقة", render: (i) => <span className="text-muted-foreground">{i.tierName}</span> },
  {
    key: "subType",
    header: "النوع",
    render: (i) => (
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ring-border">
        {i.subType === "monthly" ? "شهري" : "سنوي"}
      </span>
    ),
  },
  {
    key: "amount",
    header: "المبلغ",
    sortFn: (a, b) => a.amount - b.amount,
    render: (i) => <AmountBadge code={i.currency} value={i.amount} />,
  },
  {
    key: "paid",
    header: "الحالة",
    render: (i) => (
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          i.paid
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
        }`}
      >
        {i.paid ? "مدفوعة" : "مستحقّة"}
      </span>
    ),
  },
  {
    key: "issuedAt",
    header: "التاريخ",
    sortFn: (a, b) => a.dateMs - b.dateMs,
    render: (i) => <span className="text-xs text-muted-foreground">{i.issuedAt}</span>,
  },
];

export function InvoicesTable({ rows }: { rows: RecentInvoice[] }) {
  return (
    <DataTable
      data={rows}
      columns={COLUMNS}
      searchKey="clientName"
      searchPlaceholder="ابحث باسم العميل…"
      pageSize={10}
    />
  );
}
