"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { vatRateBpForMarket } from "@modonty/shared/lib/payments/vat-rate";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { updateOrderAction } from "../actions/update-order";

export interface OrderForEdit {
  id: string;
  number: string;
  buyerName: string;
  planName: string;
  salesRepId: string | null;
  articlesPerMonth: number | null;
  market: string;
  totalMinor: number;
  paidMonths: number;
  bonusServiceMonths: number;
  serviceStartedAt: string | null;
  activatedAt: string | null;
  paidAt: string | null;
  notes: string | null;
}

const MARKETS = [
  { key: "SA", label: "السعودية", currencyWord: "ريال" },
  { key: "EG", label: "مصر", currencyWord: "جنيه" },
] as const;

/** بلا مندوب — Radix Select لا يقبل قيمةً فارغة، فتُترجم إلى "" عند الإرسال. */
const NO_REP = "__none__";

/** نفس لغة شاشة الإنشاء (`new/components/manual-order-form.tsx`) — لا تتعدّد لغتا طلبٍ واحد. */
function vatLabel(market: string): string {
  const bp = vatRateBpForMarket(market === "EG" ? "EG" : "SA");
  return bp === 0 ? "بلا ضريبة" : `شامل ضريبة ${(bp / 100).toLocaleString("ar-EG")}٪`;
}

/** «يحتاج مراجعة» يُكتب في `notes` بادئاً بـ⚠ — يُعرض بارزاً لا مدفوناً في مربّع نصّ. */
function ReviewBanner({ notes }: { notes: string | null }) {
  if (!notes?.startsWith("⚠")) return null;
  const parts = notes.replace(/^⚠\s*/, "").split(" · ");
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
        <AlertTriangle className="size-3.5" />
        هذا الطلب مُرحَّل ويحتاج مراجعة
      </div>
      <ul className="mt-1.5 space-y-0.5 text-xs text-amber-800 dark:text-amber-200">
        {parts.map((p) => (
          <li key={p}>• {p}</li>
        ))}
      </ul>
    </div>
  );
}

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-3.5 py-2">
        <h2 className="text-[13px] font-bold">{title}</h2>
        {aside}
      </div>
      <div className="flex flex-col gap-3 p-3.5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function OrderEditForm({
  order,
  isMigrated,
  salesReps,
}: {
  order: OrderForEdit;
  isMigrated: boolean;
  salesReps: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, action, pending] = useActionState(updateOrderAction, null);

  const [market, setMarket] = useState(order.market);
  const [salesRepId, setSalesRepId] = useState(order.salesRepId ?? NO_REP);
  const [total, setTotal] = useState((order.totalMinor / 100).toString());
  const [paidMonths, setPaidMonths] = useState(String(order.paidMonths));
  const [bonusMonths, setBonusMonths] = useState(String(order.bonusServiceMonths));
  const [notes, setNotes] = useState(order.notes ?? "");
  /** أيُّ تغييرٍ في الفورم — الحفظُ بلا تغيير ضغطةٌ لا تفعل شيئاً. */
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast({ title: "لم يُحفظ التعديل", description: state.error, variant: "destructive" });
      return;
    }
    toast({ title: "حُفظ التعديل", description: "وسُجّل في سجلّ التدقيق." });
    router.push(`/orders/${order.id}`);
  }, [state, toast, router, order.id]);

  const currencyWord = MARKETS.find((m) => m.key === market)?.currencyWord ?? "";
  const totalNum = Number(total);
  const paidNum = Number(paidMonths);
  const serviceMonths = paidNum + (Number(bonusMonths) || 0);
  const monthly = paidNum > 0 && Number.isFinite(totalNum) ? Math.round(totalNum / paidNum) : null;

  return (
    <form action={action} onChange={() => setDirty(true)} className="flex flex-col gap-3">
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="market" value={market} />
      <input type="hidden" name="salesRepId" value={salesRepId === NO_REP ? "" : salesRepId} />
      {/**
        * يومُ الدفع لا يُعرض (خالد ٢٣ سبتمبر ٢٠٢٦): العميلُ لا يُفعَّل إلّا حين يدفع، فيومُ
        * التفعيل يكفي في الشاشة. لكنّ الأكشن يقرأ الحقلَ الغائبَ «لا تاريخ» ويمسحه — فيُرسل
        * كما هو، ويبقى بلحظته (`keepIfSameDay`).
        */}
      <input type="hidden" name="paidAt" value={order.paidAt ?? ""} />

      <ReviewBanner notes={order.notes} />

      <Section title="الاشتراك">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="اسم الباقة">
            <Input name="planName" defaultValue={order.planName} maxLength={60} required className="h-9" />
          </Field>
          <Field label="مقالات في الشهر">
            <Input
              name="articlesPerMonth"
              type="number"
              min={0}
              max={200}
              defaultValue={order.articlesPerMonth ?? ""}
              className="h-9 tabular-nums"
              dir="ltr"
            />
          </Field>
          <Field label="مندوب المبيعات">
            <Select
              value={salesRepId}
              onValueChange={(v) => {
                setSalesRepId(v);
                setDirty(true);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_REP}>غير محدد</SelectItem>
                {salesReps.map((rep) => (
                  <SelectItem key={rep.id} value={rep.id}>
                    {rep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <Section
        title="المبلغ والمدّة"
        aside={
          /* السوق يحكم العملة والضريبة، فيُقرأ قبل الأرقام لا بينها — كشاشة الإنشاء. */
          <div className="flex gap-1" role="group" aria-label="السوق">
            {MARKETS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => {
                  setMarket(m.key);
                  setDirty(true);
                }}
                aria-pressed={market === m.key}
                className={cn(
                  "rounded px-2 py-0.5 text-xs font-bold transition-colors",
                  market === m.key
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={`المبلغ المدفوع (${currencyWord})`}>
            <Input
              name="total"
              type="number"
              step="0.01"
              min={0}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
              className="h-9 tabular-nums"
              dir="ltr"
            />
          </Field>
          <Field label="الشهور المدفوعة">
            <Input
              name="paidMonths"
              type="number"
              min={1}
              max={60}
              value={paidMonths}
              onChange={(e) => setPaidMonths(e.target.value)}
              required
              className="h-9 tabular-nums"
              dir="ltr"
            />
          </Field>
          <Field label="شهور الهدية">
            <Input
              name="bonusServiceMonths"
              type="number"
              min={0}
              max={24}
              value={bonusMonths}
              onChange={(e) => setBonusMonths(e.target.value)}
              className="h-9 tabular-nums"
              dir="ltr"
            />
          </Field>
        </div>

        {/* الرقم الذي يُحفظ الطلب من أجله — يُقرأ محسوباً قبل الحفظ، لا يُكتشف بعده. */}
        <div className="-mx-3.5 -mb-3.5 mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t bg-muted/40 px-3.5 py-3">
          <span className="text-2xl font-extrabold leading-none tabular-nums">
            {Number.isFinite(totalNum) ? totalNum.toLocaleString() : "—"}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">{currencyWord}</span>
          <span className="text-xs text-muted-foreground">
            · {vatLabel(market)}
            {monthly != null ? ` · ${monthly.toLocaleString()} ${currencyWord} للشهر` : null}
            {paidNum > 0 ? ` · خدمة ${serviceMonths} شهراً` : null}
          </span>
        </div>
      </Section>

      <Section title="التواريخ">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="يوم التفعيل" hint="العميل يُفعَّل يوم يدفع">
            <Input name="activatedAt" type="date" defaultValue={order.activatedAt ?? ""} className="h-9" dir="ltr" />
          </Field>
          {/**
            * أوّلُ مقال = بدايةُ الخدمة (`serviceStartedAt`) — منه تُحسب نهاية الاشتراك.
            *
            * يُختم وحده حين يصل أوّلُ مقالٍ للعميل (`lib/orders/start-service-clock.ts`)، فلا
            * يُعدَّل في الطلب العاديّ. والمُرحَّل استثناء (خالد ٢٣ سبتمبر ٢٠٢٦: «خليها مرنة»):
            * مقالاتُه سُلّمت قبل النظام، فلا يعرف تاريخَها إلّا من يكتبه.
            */}
          {isMigrated ? (
            <Field label="أوّل مقال" hint="طلب مُرحَّل — منه تُحسب نهاية الاشتراك">
              <Input name="serviceStartedAt" type="date" defaultValue={order.serviceStartedAt ?? ""} className="h-9" dir="ltr" />
            </Field>
          ) : (
            <Field label="أوّل مقال" hint="يُسجَّل وحده حين يصل أوّل مقال للعميل">
              <input type="hidden" name="serviceStartedAt" value={order.serviceStartedAt ?? ""} />
              <div className="flex h-9 items-center rounded-md border border-dashed bg-muted/40 px-3 text-sm tabular-nums" dir="ltr">
                {order.serviceStartedAt ?? <span className="text-muted-foreground" dir="rtl">لم يُسلَّم بعد</span>}
              </div>
            </Field>
          )}
        </div>
      </Section>

      <Section title="ملاحظة داخلية">
        <Textarea
          name="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
          placeholder="سبب التعديل، أو ما تبقّى للمراجعة"
        />
        {notes.startsWith("⚠") ? (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            امسح الوسم ⚠ من أوّل الملاحظة بعد ما تتأكّد من الأرقام — هو ما يميّز المُراجَع من غيره.
          </p>
        ) : null}
      </Section>

      <div className="flex items-center justify-end gap-2">
        <span className="me-auto text-xs text-muted-foreground">
          {dirty ? "تغييرات لم تُحفظ" : "لا تغييرات بعد"}
        </span>
        <Button variant="outline" size="sm" asChild className="h-9">
          <Link href={`/orders/${order.id}`}>إلغاء</Link>
        </Button>
        <Button type="submit" size="sm" disabled={pending || !dirty} className="h-9 gap-1.5">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          حفظ التعديل
        </Button>
      </div>
    </form>
  );
}
