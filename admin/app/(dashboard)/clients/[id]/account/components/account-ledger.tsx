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
import { archiveInvoiceAction } from "../actions/archive-invoice";
import { convertOpeningBalanceAction } from "../actions/convert-opening-balance";

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
}

interface Props {
  clientId: string;
  invoices: LedgerInvoice[];
  // Issue-dialog context (plan/period/currency come from the client card).
  planLabel: string; // "الانطلاقة · سنوي"
  currency: Currency;
  defaultAmount: number | null; // reference price for the current tier+period
  /** First published article — billing only starts once the client's content is live. */
  firstPublishedAt: string | null; // yyyy-mm-dd
  /** Where the subscription currently runs to; a renewal continues from here. */
  currentEnd: string | null; // yyyy-mm-dd
  /** Founding payment stored on the client; drives the «Auto Button» that documents it. */
  openingBalance: number | null;
  /** True once a fromOpeningBalance invoice exists — the button then disappears. */
  openingBalanceConverted: boolean;
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
  planLabel,
  currency,
  defaultAmount,
  firstPublishedAt,
  currentEnd,
  openingBalance,
  openingBalanceConverted,
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
        <IssueInvoiceDialog
          clientId={clientId}
          planLabel={planLabel}
          currency={currency}
          defaultAmount={defaultAmount}
          firstPublishedAt={firstPublishedAt}
          currentEnd={currentEnd}
          blockingNumber={blocking?.number ?? null}
        />
      </div>

      {blocking && (
        <p className="border-b bg-amber-500/[0.07] px-4 py-2 text-[12px] text-amber-700 dark:text-amber-400">
          <b className="font-semibold">فاتورة {blocking.number} غير مسدّدة.</b> ما نصدر فاتورة
          جديدة قبل إقفالها — حدّدها مدفوعة، أو أرشفها لو أُصدرت بالغلط.
        </p>
      )}

      {openingBalance && openingBalance > 0 && !openingBalanceConverted && (
        <OpeningBalanceBanner
          clientId={clientId}
          amount={openingBalance}
          currency={currency}
          hasArticle={!!firstPublishedAt}
        />
      )}

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
function OpeningBalanceBanner({
  clientId,
  amount,
  currency,
  hasArticle,
}: {
  clientId: string;
  amount: number;
  currency: Currency;
  hasArticle: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function convert() {
    if (!hasArticle) return;
    startTransition(async () => {
      const res = await convertOpeningBalanceAction(clientId);
      if (res.ok) {
        toast({
          title: `تم تجهيز الفاتورة ${res.number}`,
          description: "الفاتورة الأولى تمثّل الرصيد الافتتاحي — مدفوعة ومسجّلة.",
        });
        router.refresh();
      } else {
        toast({ title: "تعذّر التجهيز", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b bg-sky-500/[0.07] px-4 py-2.5">
      <div className="min-w-0 flex-1 text-[12px] text-sky-800 dark:text-sky-300">
        <b className="font-semibold">رصيد افتتاحي {money(amount, currency)}</b> — دفعة التأسيس
        مسجّلة كمبيعة. {hasArticle
          ? "جهّز الفاتورة الأولى اللي تمثّلها بضغطة."
          : "تبدأ الفوترة مع أول مقال منشور — الزر يشتغل بعدها."}
      </div>
      <Button
        size="sm"
        className="gap-1.5 bg-sky-600 hover:bg-sky-500 text-white shrink-0"
        onClick={convert}
        disabled={!hasArticle || isPending}
        title={hasArticle ? undefined : "لا يوجد مقال منشور بعد"}
      >
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        تجهيز الفاتورة من الرصيد
      </Button>
    </div>
  );
}

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

function IssueInvoiceDialog({
  clientId,
  planLabel,
  currency,
  defaultAmount,
  firstPublishedAt,
  currentEnd,
  blockingNumber,
}: {
  clientId: string;
  planLabel: string;
  currency: Currency;
  defaultAmount: number | null;
  firstPublishedAt: string | null;
  currentEnd: string | null;
  /** Outstanding invoice that must be settled or archived first — null when free to issue. */
  blockingNumber: string | null;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : "");
  const [months, setMonths] = useState<number>(12);
  const [confirmNotActivated, setConfirmNotActivated] = useState(false);

  const today = todayInput();
  // Same order the server uses: the current end (past or future — a renewal continues
  // from it) → first published article → today.
  const anchor = currentEnd ?? firstPublishedAt ?? today;
  const previewEnd = addMonthsISO(anchor, months);
  const notActivated = !firstPublishedAt;

  const value = Number(amount) || 0;
  const canSubmit = value > 0 && months > 0 && (!notActivated || confirmNotActivated);

  function submit() {
    if (!canSubmit) return;
    startTransition(async () => {
      const res = await createInvoiceAction({
        clientId,
        amount: value,
        months,
        confirmNotActivated,
      });
      if (res.ok) {
        toast({
          title: `تم إصدار الفاتورة ${res.number}`,
          description: `الاشتراك يمتدّ حتى ${res.subscriptionEnd} — مستحقّة، أرسلها ثم حدّدها مدفوعة عند السداد.`,
        });
        setOpen(false);
        setAmount(defaultAmount ? String(defaultAmount) : "");
        setMonths(12);
        setConfirmNotActivated(false);
        router.refresh();
      } else {
        toast({
          title: "فشل الإصدار",
          description: res.error === "NOT_ACTIVATED" ? "أكّد الإصدار قبل بدء الاشتراك." : res.error,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
        onClick={() => setOpen(true)}
        disabled={!!blockingNumber}
        title={blockingNumber ? `فاتورة ${blockingNumber} غير مسدّدة` : undefined}
      >
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
              <Label htmlFor="issue-months">المدة</Label>
              <select
                id="issue-months"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m === 1 ? "شهر" : m === 2 ? "شهران" : m <= 10 ? `${m} أشهر` : `${m} شهراً`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* The end date is shown, never typed — a hand-entered date is how the wrong
              renewal day gets into the record. */}
          <div className="rounded-md border bg-muted/30 px-3 py-2.5 text-[12px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">الاشتراك يمتدّ حتى</span>
              <span className="font-bold tabular-nums text-foreground">{previewEnd}</span>
            </div>
            <p className="pt-1 text-[11px] text-muted-foreground">
              {currentEnd
                ? `تجديد — يُحتسب من نهاية الاشتراك ${currentEnd < today ? "المنتهية" : "الحالية"} (${currentEnd})`
                : firstPublishedAt
                  ? `يُحتسب من تاريخ أول مقال منشور (${firstPublishedAt})`
                  : "يُحتسب من اليوم"}
            </p>
          </div>

          {notActivated && (
            <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
              <input
                type="checkbox"
                checked={confirmNotActivated}
                onChange={(e) => setConfirmNotActivated(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
              />
              <span className="text-[12px] leading-relaxed text-amber-700 dark:text-amber-400">
                <span className="font-semibold">لم يُنشر أي مقال لهذا العميل بعد.</span> الاشتراك يبدأ
                مع نشر أول مقال — الإصدار الآن يحتسب المدة من اليوم. أكّد إن كنت تقصد ذلك.
              </span>
            </label>
          )}

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
