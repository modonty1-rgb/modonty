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

import { markInvoicePaidAction } from "../actions/mark-paid";
import { sendInvoiceAction } from "@/lib/invoices/send-invoice-action";
import { archiveInvoiceAction } from "../actions/archive-invoice";

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
  /** Voided — kept in the ledger for accounting, but owes nothing and blocks nothing. */
  isArchived: boolean;
  archivedReason: string | null;
  /** PAY-E4: only present on an invoice born from a checkout order — the tax breakdown
   *  from that order's own price snapshot, in minor units. Absent on every older invoice. */
  taxBreakdown: { subtotalMinor: number; vatMinor: number; vatRateBp: number } | null;
}

interface Props {
  clientId: string;
  invoices: LedgerInvoice[];
  // Issue-dialog context (plan/period/currency come from the client card).
  currency: Currency;
  /** First published article — billing only starts once the client's content is live. */
  /** Where the subscription currently runs to; a renewal continues from here. */
  /** Founding payment stored on the client; drives the «Auto Button» that documents it. */
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

export function AccountLedger({
  clientId,
  invoices,
  currency,
}: Props) {
  // One outstanding invoice at a time — we do not sell on credit. Mirrors the server
  // guard so the button explains itself instead of failing after the click. `findLast`
  // because the rows arrive newest-first and the server names the OLDEST outstanding one;
  // the two must name the same invoice or the message sends the admin to the wrong row.
  const blocking = invoices.findLast((i) => i.status === "DUE" && !i.isArchived) ?? null;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold">الفواتير</h2>
          <span className="text-[11px] text-muted-foreground">
            {invoices.length} {invoices.length === 1 ? "فاتورة" : "فواتير"}
          </span>
        </div>
      </div>

      {blocking && (
        <p className="border-b bg-amber-500/[0.07] px-4 py-2 text-[12px] text-amber-700 dark:text-amber-400">
          <b className="font-semibold">فاتورة {blocking.number} غير مسدّدة.</b> ما نصدر فاتورة
          جديدة قبل إقفالها — حدّدها مدفوعة، أو أرشفها لو أُصدرت بالغلط.
        </p>
      )}

      {/* سقط بانرُ «الرصيد الافتتاحيّ» (١٧ سبتمبر ٢٠٢٦): كان يعرض رقماً على الكرت
          ويعرض زرّاً يحوّله إلى فاتورة. وصار لكلّ عميلٍ طلبٌ يحمل المبلغَ بعملته
          وتاريخه، والفاتورةُ تُصدر منه — فسقط الرقمُ والزرُّ معاً. مقيسٌ قبل الإسقاط:
          ٢٨ عميلاً لهم رصيد، و٢٨ منهم صار له طلبٌ بنفس المبلغ. */}

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

// ── Opening balance → first invoice (the «Auto Button») ───────────────
// The founding payment already sits on the client (and already counts in the sales report).
// This one click documents it as the first PAID invoice — but only once the client's first
// article is live, because billing starts when content goes live.

function InvoiceRow({ invoice }: { invoice: LedgerInvoice }) {
  const paid = invoice.status === "PAID";
  const archived = invoice.isArchived;

  // An archived invoice is history, not work: it keeps its place in the ledger and loses
  // every action. Struck through so the eye skips it while auditing.
  return (
    <tr className={archived ? "opacity-55" : paid ? "" : "bg-amber-500/[0.06]"}>
      <td className="tabular-nums text-muted-foreground">{invoice.issuedAtLabel}</td>
      <td className={`font-medium tabular-nums ${archived ? "line-through" : ""}`}>{invoice.number}</td>
      <td className="text-muted-foreground">
        {invoice.description}
        {archived && invoice.archivedReason && (
          <span className="block text-[11px] text-muted-foreground/80">سبب الأرشفة: {invoice.archivedReason}</span>
        )}
      </td>
      <td className={`text-center tabular-nums font-semibold ${archived ? "line-through" : ""}`}>
        {money(invoice.amount, invoice.currency)}
        {invoice.taxBreakdown ? (
          <span className="block text-[10.5px] font-normal text-muted-foreground">
            صافٍ {money(invoice.taxBreakdown.subtotalMinor / 100, invoice.currency)} + ضريبة {money(invoice.taxBreakdown.vatMinor / 100, invoice.currency)} ({invoice.taxBreakdown.vatRateBp / 100}٪)
          </span>
        ) : null}
      </td>
      <td className="text-center">
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
            archived
              ? "bg-muted text-muted-foreground"
              : paid
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
          }`}
        >
          {archived ? "مؤرشفة" : paid ? "مدفوعة" : "مستحقّة"}
        </span>
      </td>
      <td className="text-end">
        <div className="inline-flex items-center gap-3 justify-end">
          {archived ? (
            <span className="text-[12px] text-muted-foreground">—</span>
          ) : paid ? (
            <>
              <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ تم السداد</span>
              {!invoice.emailSent && <SendButton invoiceId={invoice.id} />}
            </>
          ) : (
            <>
              <SendButton invoiceId={invoice.id} />
              <ArchiveDialog invoiceId={invoice.id} number={invoice.number} />
              <MarkPaidDialog invoiceId={invoice.id} number={invoice.number} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Issue invoice ─────────────────────────────────────────────────────
const MONTH_OPTIONS = [1, 2, 3, 6, 12, 18] as const;

/**
 * Mirrors the server's addMonths so the preview cannot disagree with what gets saved.
 * All arithmetic is in UTC: parsing `2027-04-24` as local time and then formatting the
 * result with `toISOString()` shifted the preview a day back east of Greenwich (it showed
 * 2028-04-23 for a date the server stored as 2028-04-24).
 */
function addMonthsISO(fromISO: string, months: number): string {
  const [y, m, d] = fromISO.split("-").map(Number);
  const out = new Date(Date.UTC(y, m - 1 + months, d));
  if (out.getUTCDate() < d) out.setUTCDate(0); // overflowed → last day of the intended month
  return out.toISOString().slice(0, 10);
}

/**
 * **لا إصدارَ فاتورةٍ من كرت العميل** (خالد ١٩ سبتمبر ٢٠٢٦: «إصدار الفاتورة مكانه مكان
 * واحد عشان ما يكون في أيّ لخبطة»).
 *
 * كان هنا حوارٌ يسأل الموظّف عن **المبلغ والمدّة بيده**، فتخرج فاتورةٌ لا يحكمها طلب:
 * رقمٌ يخالف ما دفعه العميلُ فعلاً، ومدّةٌ تخالف مدّتَه — وهو عينُ ما قامت عليه قسمةُ
 * المال (مصدرٌ واحد: الطلب). وبابُ الإصدار اليومَ واحدٌ: `/orders/[id]/invoice`، يقرأ
 * الطلبَ ولا يسأل عن رقم.
 *
 * وسقط معه `actions/create-invoice.ts` — كان مستهلكُه الوحيد.
 */

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

// ── Archive (void) ────────────────────────────────────────────────────
/**
 * The single escape from «فاتورة واحدة مستحقّة في المرة». Archiving voids an invoice
 * issued in error without deleting it — the accounting record stays whole — and pulls
 * its period back out of the subscription end date.
 */
function ArchiveDialog({ invoiceId, number }: { invoiceId: string; number: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");

  function confirm() {
    if (!reason.trim()) return;
    startTransition(async () => {
      const res = await archiveInvoiceAction({ invoiceId, reason: reason.trim() });
      if (res.ok) {
        toast({
          title: "أُرشفت الفاتورة",
          description: "خرجت من المستحقات، وتاريخ الاشتراك أُعيد حسابه بدونها.",
        });
        setOpen(false);
        setReason("");
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
        className="text-[12px] text-muted-foreground hover:text-destructive"
      >
        أرشفة
      </button>
      <DialogContent dir="rtl" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">أرشفة الفاتورة — {number}</DialogTitle>
        </DialogHeader>
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-[12px] leading-relaxed text-amber-700 dark:text-amber-400">
          الفاتورة ما تُحذف — تبقى في السجل للحسابات، لكنها تخرج من المستحقات، ومدّتها تُسحب من
          تاريخ نهاية الاشتراك. تُستخدم للفاتورة الصادرة بالخطأ فقط.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="archive-reason">سبب الأرشفة</Label>
          <input
            id="archive-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مثال: أُصدرت بمبلغ خاطئ"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            إلغاء
          </Button>
          <Button onClick={confirm} disabled={!reason.trim() || isPending} variant="destructive" className="gap-1.5">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            تأكيد الأرشفة
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
