"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { createInvoiceAction } from "../actions/create-invoice";
import { markInvoicePaidAction } from "../actions/mark-paid";
import { sendInvoiceAction } from "../actions/send-invoice";

export type Currency = "SAR" | "EGP";

export interface LedgerInvoice {
  id: string;
  number: string;
  issuedAtLabel: string;
  description: string; // e.g. "الانطلاقة · سنوي"
  amount: number;
  currency: Currency;
  status: "PAID" | "DUE";
  emailSent: boolean;
}

interface Props {
  clientId: string;
  invoices: LedgerInvoice[];
  // Issue-dialog context (plan/period/currency come from the client card).
  planLabel: string; // "الانطلاقة · سنوي"
  currency: Currency;
  defaultAmount: number | null; // reference price for the current tier+period
}

function money(amount: number, currency: Currency) {
  return `${new Intl.NumberFormat("en-US").format(amount)} ${currency}`;
}

function todayInput(): string {
  // yyyy-mm-dd for <input type=date>, local time.
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

export function AccountLedger({ clientId, invoices, planLabel, currency, defaultAmount }: Props) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold">الفواتير</h2>
          <span className="text-[11px] text-muted-foreground">
            {invoices.length} {invoices.length === 1 ? "فاتورة" : "فواتير"}
          </span>
        </div>
        <IssueInvoiceDialog
          clientId={clientId}
          planLabel={planLabel}
          currency={currency}
          defaultAmount={defaultAmount}
        />
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
          <p className="text-sm font-medium">لا توجد فواتير بعد</p>
          <p className="text-xs text-muted-foreground">أصدر أول فاتورة لهذا العميل وستظهر هنا.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] whitespace-nowrap">
            <thead>
              <tr className="border-b bg-muted/40 text-[11px] text-muted-foreground [&>th]:px-3 [&>th]:py-2.5 [&>th]:font-semibold [&>th]:text-start">
                <th>التاريخ</th>
                <th>الفاتورة</th>
                <th>الوصف</th>
                <th className="!text-center">المبلغ</th>
                <th className="!text-center">الحالة</th>
                <th className="!text-end">إجراء</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-b [&>tr:last-child]:border-0 [&_td]:px-3 [&_td]:py-2.5">
              {invoices.map((inv) => (
                <InvoiceRow key={inv.id} invoice={inv} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: LedgerInvoice }) {
  const paid = invoice.status === "PAID";
  return (
    <tr className={paid ? "" : "bg-amber-500/[0.06]"}>
      <td className="tabular-nums text-muted-foreground">{invoice.issuedAtLabel}</td>
      <td className="font-medium tabular-nums">{invoice.number}</td>
      <td className="text-muted-foreground">{invoice.description}</td>
      <td className="text-center tabular-nums font-semibold">{money(invoice.amount, invoice.currency)}</td>
      <td className="text-center">
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
            paid
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
          }`}
        >
          {paid ? "مدفوعة" : "مستحقّة"}
        </span>
      </td>
      <td className="text-end">
        <div className="inline-flex items-center gap-3 justify-end">
          {paid ? (
            <>
              <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ تم السداد</span>
              {!invoice.emailSent && <SendButton invoiceId={invoice.id} />}
            </>
          ) : (
            <>
              <SendButton invoiceId={invoice.id} />
              <MarkPaidDialog invoiceId={invoice.id} number={invoice.number} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Issue invoice ─────────────────────────────────────────────────────
function IssueInvoiceDialog({
  clientId,
  planLabel,
  currency,
  defaultAmount,
}: {
  clientId: string;
  planLabel: string;
  currency: Currency;
  defaultAmount: number | null;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : "");
  const [endDate, setEndDate] = useState("");

  const value = Number(amount) || 0;
  const canSubmit = value > 0 && !!endDate;

  function submit() {
    if (!canSubmit) return;
    startTransition(async () => {
      const res = await createInvoiceAction({ clientId, amount: value, subscriptionEnd: endDate });
      if (res.ok) {
        toast({ title: `تم إصدار الفاتورة ${res.number}`, description: "مستحقّة — أرسلها ثم حدّدها مدفوعة عند السداد." });
        setOpen(false);
        setAmount(defaultAmount ? String(defaultAmount) : "");
        setEndDate("");
        router.refresh();
      } else {
        toast({ title: "فشل الإصدار", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => setOpen(true)}>
        + إصدار فاتورة
      </Button>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إصدار فاتورة</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="issue-amount">المبلغ</Label>
              <div className="flex h-10 items-stretch overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring/40">
                <input
                  id="issue-amount"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent px-3 text-sm outline-none tabular-nums min-w-0"
                />
                <span className="px-3 shrink-0 border-s bg-muted/50 flex items-center text-sm font-semibold text-muted-foreground">
                  {currency}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="issue-end">تاريخ الانتهاء</Label>
              <input
                id="issue-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>

          <p className="text-[12px] text-muted-foreground">
            للباقة الحالية: <span className="font-semibold text-foreground">{planLabel}</span>
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            إلغاء
          </Button>
          <Button
            onClick={submit}
            disabled={!canSubmit || isPending}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            إصدار وحفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Mark paid ─────────────────────────────────────────────────────────
function MarkPaidDialog({ invoiceId, number }: { invoiceId: string; number: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [paidDate, setPaidDate] = useState(todayInput());

  function confirm() {
    if (!paidDate) return;
    startTransition(async () => {
      const res = await markInvoicePaidAction({ invoiceId, paidDate });
      if (res.ok) {
        toast({ title: "تم تسجيل السداد", description: "الفاتورة مدفوعة · تمدّد الاشتراك." });
        setOpen(false);
        router.refresh();
      } else {
        toast({ title: "فشل", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold"
      >
        تحديد مدفوعة
      </button>
      <DialogContent dir="rtl" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">تحديد مدفوعة — {number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="paid-date">تاريخ السداد</Label>
          <input
            id="paid-date"
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            إلغاء
          </Button>
          <Button
            onClick={confirm}
            disabled={!paidDate || isPending}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            تأكيد السداد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Send email ────────────────────────────────────────────────────────
function SendButton({ invoiceId }: { invoiceId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function send() {
    startTransition(async () => {
      const res = await sendInvoiceAction(invoiceId);
      if (res.ok) {
        toast({ title: "أُرسلت الفاتورة", description: "وصلت العميل بالإيميل ✓" });
        router.refresh();
      } else {
        toast({ title: "فشل الإرسال", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={send}
      disabled={isPending}
      className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-50"
    >
      {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
      إرسال
    </button>
  );
}
