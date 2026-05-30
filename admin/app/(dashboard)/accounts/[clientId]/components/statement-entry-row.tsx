"use client";

import { useState } from "react";
import { FileText, ArrowDownCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StatementEntry } from "./account-statement";

const dateFmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" });

const STATUS_LABEL: Record<StatementEntry["status"], string> = {
  PAID: "مدفوعة",
  DUE: "مستحقّة",
  OVERDUE: "متأخّرة",
  RECORDED: "مُسجّلة",
};

const STATUS_TONE: Record<StatementEntry["status"], string> = {
  PAID: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  DUE: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  OVERDUE: "bg-red-500/15 text-red-600 dark:text-red-400",
  RECORDED: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};

function money(amount: number, currency: "SAR" | "EGP") {
  return new Intl.NumberFormat(currency === "SAR" ? "ar-SA" : "ar-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StatementEntryRow({ entry, clientName }: { entry: StatementEntry; clientName: string }) {
  const [open, setOpen] = useState(false);
  const isPayment = entry.kind === "payment";
  const Icon = isPayment ? ArrowDownCircle : FileText;
  const currency = entry.currency ?? "SAR";

  return (
    <li className="relative">
      <span
        className={`absolute -start-6 top-2 flex h-[22px] w-[22px] items-center justify-center rounded-full ring-2 ring-card ${
          isPayment ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-foreground"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-md py-2 pe-2 text-start transition-colors hover:bg-muted/40"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{entry.label}</p>
          <p className="text-xs text-muted-foreground tabular-nums">{dateFmt.format(entry.date)}</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_TONE[entry.status]}`}>
          {STATUS_LABEL[entry.status]}
        </span>
        <span
          className={`text-sm font-semibold tabular-nums shrink-0 w-24 text-end ${
            isPayment ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
          }`}
        >
          {isPayment ? "−" : "+"}
          {money(entry.amount, currency)}
        </span>
      </button>

      {/* Details dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {isPayment ? "تفاصيل الدفعة" : "تفاصيل الفاتورة"}
            </DialogTitle>
          </DialogHeader>

          <dl className="mt-1 divide-y text-sm">
            {entry.invoiceNumber && <Row label="رقم الفاتورة" value={entry.invoiceNumber} mono />}
            <Row label="العميل" value={clientName} />
            <Row label="الوصف" value={entry.label} />
            {entry.periodLabel && <Row label="الفترة" value={entry.periodLabel} />}
            {entry.rangeStart && entry.rangeEnd && (
              <Row label="المدة" value={`${dateFmt.format(entry.rangeStart)} ← ${dateFmt.format(entry.rangeEnd)}`} />
            )}
            <Row label="التاريخ" value={dateFmt.format(entry.date)} />
            {entry.method && <Row label="طريقة الدفع" value={entry.method} />}
            <Row label="المبلغ" value={money(entry.amount, currency)} strong />
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-muted-foreground">الحالة</dt>
              <dd>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_TONE[entry.status]}`}>
                  {STATUS_LABEL[entry.status]}
                </span>
              </dd>
            </div>
          </dl>
        </DialogContent>
      </Dialog>
    </li>
  );
}

function Row({ label, value, mono, strong }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className={`text-end ${strong ? "font-bold" : "font-medium"} ${mono ? "tabular-nums tracking-wide" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
