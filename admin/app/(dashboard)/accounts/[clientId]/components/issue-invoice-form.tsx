"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, CalendarClock, Loader2 } from "lucide-react";
import type { SubscriptionTier } from "@prisma/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { createInvoiceAction } from "../actions/create-invoice";

export type Currency = "SAR" | "EGP";
export type Period = "monthly" | "annual";

export interface TierOption {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: { SAR: number; EGP: number };
  priceAnnual: { SAR: number; EGP: number };
}

interface Props {
  clientId: string;
  clientName: string;
  tiers: TierOption[];
  currentTier: SubscriptionTier;
  defaultCurrency: Currency;
  currentEndDate: string | null; // ISO — shown as a hint only
}

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "تحويل بنكي" },
  { value: "mada", label: "مدى" },
  { value: "instapay", label: "InstaPay" },
  { value: "card", label: "بطاقة (Visa / Mastercard)" },
  { value: "stc_pay", label: "STC Pay" },
  { value: "apple_pay", label: "Apple Pay" },
  { value: "cash", label: "نقدي" },
] as const;

const dateFmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" });
const num = new Intl.NumberFormat("ar-SA");

function fmtDateInput(v: string): string {
  // v is yyyy-mm-dd from <input type=date>
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : dateFmt.format(d);
}

export function IssueInvoiceForm({ clientId, clientName, tiers, currentTier, defaultCurrency, currentEndDate }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tier, setTier] = useState<SubscriptionTier | undefined>(
    (tiers.find((t) => t.tier === currentTier) ?? tiers[0])?.tier
  );
  const [period, setPeriod] = useState<Period>("annual");
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [price, setPrice] = useState("");
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0].value);
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "DUE">("PAID");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const selectedTier = tiers.find((t) => t.tier === tier);
  const tierName = selectedTier?.name ?? "—";
  const refPrice = selectedTier
    ? (period === "monthly" ? selectedTier.priceMonthly : selectedTier.priceAnnual)[currency]
    : null;
  const methodLabel = PAYMENT_METHODS.find((m) => m.value === method)?.label ?? "—";
  const periodLabel = period === "monthly" ? "شهري" : "سنوي";
  const amount = Number(price) || 0;
  const currentEndLabel = currentEndDate ? dateFmt.format(new Date(currentEndDate)) : null;

  // No invoice until the data is complete.
  const missing: string[] = [];
  if (!tier) missing.push("الباقة");
  if (amount <= 0) missing.push("المبلغ");
  if (!startDate) missing.push("بداية الاشتراك");
  if (!endDate) missing.push("نهاية الاشتراك");
  const isComplete = missing.length === 0;

  function handleSubmit() {
    if (!tier || !isComplete) {
      toast({ title: "أكمل البيانات", description: `الناقص: ${missing.join(" · ")}`, variant: "destructive" });
      return;
    }
    startTransition(async () => {
      const res = await createInvoiceAction({
        clientId,
        tier,
        tierName,
        period,
        currency,
        amount,
        paymentMethod: method,
        paymentMethodLabel: methodLabel,
        paymentStatus,
        subscriptionStart: startDate || null,
        subscriptionEnd: endDate || null,
      });
      if (res.ok) {
        toast({
          title: `تم إصدار الفاتورة ${res.number}`,
          description: res.emailed ? "أُرسلت للعميل بالإيميل ✓" : "تعذّر إرسال الإيميل — راجع الإعدادات.",
        });
        router.refresh();
      } else {
        toast({ title: "فشل الإصدار", description: res.error, variant: "destructive" });
      }
    });
  }

  if (tiers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        لا توجد باقات مُفعّلة. أضِف الباقات من صفحة Subscription Tiers أولاً.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
      {/* ── Inputs ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tier — reference price shown above the dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="invoice-tier">الباقة</Label>
              {refPrice !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  السعر المرجعي: {num.format(refPrice)} {currency}
                </span>
              )}
            </div>
            <Select value={tier} onValueChange={(v) => setTier(v as SubscriptionTier)}>
              <SelectTrigger id="invoice-tier" className="h-10">
                <SelectValue placeholder="اختر الباقة" />
              </SelectTrigger>
              <SelectContent>
                {tiers.map((t) => (
                  <SelectItem key={t.tier} value={t.tier}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period — full-width segmented */}
          <Field label="الفترة">
            <div className="grid grid-cols-2 h-10 rounded-md border bg-muted/40 p-1 gap-1">
              <SegBtn active={period === "monthly"} onClick={() => setPeriod("monthly")}>
                شهري
              </SegBtn>
              <SegBtn active={period === "annual"} onClick={() => setPeriod("annual")}>
                سنوي
              </SegBtn>
            </div>
          </Field>
        </div>

        {/* Amount (+ currency) and payment method on one row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="المبلغ" htmlFor="invoice-price">
            <div className="flex h-10 items-stretch overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring/40">
              <input
                id="invoice-price"
                type="number"
                inputMode="numeric"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent px-3 text-sm outline-none tabular-nums min-w-0"
              />
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger className="w-20 shrink-0 rounded-none border-0 border-s bg-muted/40 focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="EGP">EGP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Field>

          <Field label="طريقة الدفع" htmlFor="invoice-method">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="invoice-method" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Subscription start / end — entered manually */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="بداية الاشتراك" htmlFor="invoice-start">
            <input
              id="invoice-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </Field>
          <Field label="نهاية الاشتراك" htmlFor="invoice-end">
            <input
              id="invoice-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            {currentEndLabel && (
              <p className="text-xs text-muted-foreground">الانتهاء الحالي: {currentEndLabel}</p>
            )}
          </Field>
        </div>

        {/* Payment status + invoice number note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="حالة الدفع">
            <div className="grid grid-cols-2 h-10 rounded-md border bg-muted/40 p-1 gap-1">
              <SegBtn active={paymentStatus === "PAID"} onClick={() => setPaymentStatus("PAID")}>
                مدفوعة
              </SegBtn>
              <SegBtn active={paymentStatus === "DUE"} onClick={() => setPaymentStatus("DUE")}>
                مستحقّة
              </SegBtn>
            </div>
          </Field>
          <div className="flex items-end pb-2">
            <p className="text-xs text-muted-foreground">
              رقم الفاتورة يُولّد تلقائياً عند الإصدار (MOD-YYYY-NNNNN).
            </p>
          </div>
        </div>
      </div>

      {/* ── Live invoice summary (fills space, anchors the action) ── */}
      <aside className="lg:sticky lg:top-4 h-fit rounded-lg bg-primary text-primary-foreground p-4 shadow-md">
        <h3 className="text-sm font-semibold mb-3">ملخّص الفاتورة</h3>
        <dl className="space-y-2.5 text-sm">
          <Row label="العميل" value={clientName} />
          <Row label="الباقة" value={tierName} />
          <Row label="الفترة" value={periodLabel} />
          <Row label="طريقة الدفع" value={methodLabel} />
          <Row label="حالة الدفع" value={paymentStatus === "PAID" ? "مدفوعة" : "مستحقّة"} />
          <Row label="بداية الاشتراك" value={startDate ? fmtDateInput(startDate) : "—"} />
          <Row
            label="نهاية الاشتراك"
            value={endDate ? fmtDateInput(endDate) : "—"}
            icon={endDate ? CalendarClock : undefined}
          />
        </dl>

        <div className="mt-4 border-t border-primary-foreground/20 pt-3">
          <p className="text-xs opacity-70">المبلغ الإجمالي</p>
          <p className="mt-1 text-2xl font-bold tabular-nums leading-none">
            {num.format(amount)} <span className="text-base font-medium opacity-70">{currency}</span>
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !isComplete}
          className="mt-4 w-full gap-1.5 bg-background text-primary hover:bg-background/90 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {isPending ? "جارٍ الإصدار…" : "إصدار الفاتورة"}
        </Button>
        <p className="mt-2 text-[11px] opacity-70 text-center">
          {isComplete
            ? "رقم الفاتورة يُولّد عند الحفظ + تُرسَل للعميل بالإيميل."
            : `أكمل: ${missing.join(" · ")}`}
        </p>
      </aside>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[5px] text-sm font-medium transition-colors ${
        active ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="opacity-70 shrink-0">{label}</dt>
      <dd className="flex items-center gap-1 font-medium text-end truncate">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{value}</span>
      </dd>
    </div>
  );
}
