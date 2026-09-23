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
import { getSubscriptionStanding } from "../../../helpers/get-subscription-standing";
import { formatMonths } from "../../../helpers/format-months";

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
  isInternal: boolean;
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

/** تاريخٌ للقراءة — بشكل الحقل نفسه، بإطارٍ متقطّع يقول «لا يُكتب هنا». */
function ReadOnlyDate({ value, empty }: { value: string | null; empty: string }) {
  return (
    <div className="flex h-9 items-center rounded-md border border-dashed bg-muted/40 px-3 text-sm tabular-nums" dir="ltr">
      {value ?? (
        <span className="text-muted-foreground" dir="rtl">
          {empty}
        </span>
      )}
    </div>
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
  const [internal, setInternal] = useState(order.isInternal);
  const [startDate, setStartDate] = useState(order.serviceStartedAt ?? "");
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
  const endsAt = startDate && paidNum > 0
    ? getSubscriptionStanding({
        serviceStartedAt: new Date(startDate),
        paidMonths: paidNum,
        bonusServiceMonths: Number(bonusMonths) || 0,
      }).endsAt
    : null;
  const endDate = endsAt ? endsAt.toISOString().slice(0, 10) : null;

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

        {/* نفسُ مربّع شاشة الإنشاء (`new/components/manual-order-form.tsx`) — ويُعدَّل هنا
            لأنّ الترحيل كتب طلباتِ حساباتنا «ليست لنا». */}
        <label className="flex cursor-pointer items-start gap-2 rounded-md border border-dashed px-3 py-2">
          <input
            type="checkbox"
            name="isInternal"
            checked={internal}
            onChange={(e) => setInternal(e.target.checked)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span className="text-xs">
            <span className="font-medium">حساب لنا — لا بيع</span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              مدونتي · جبر · بسيطة. يخرج من تقارير الإيراد، ويتحدّث معه حساب العميل المربوط.
            </span>
          </span>
        </label>
      </Section>

      {/**
        * حسابُنا لا يُباع، فلا مبلغَ ولا مدّةَ تُقرأ له (خالد ٢٣ سبتمبر ٢٠٢٦). يُخفى ولا يُزال:
        * حقولُه تبقى في الفورم فتُرسل قيمَها كما هي، والأكشنُ لا يرى فرقاً ولا يمسح شيئاً.
        */}
      <div hidden={internal}>
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
            {paidNum > 0 ? ` · خدمة ${formatMonths(serviceMonths)}` : null}
          </span>
        </div>
      </Section>
      </div>

      <Section title="التواريخ">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="تاريخ التفعيل" hint="يوم فتح حساب العميل">
            <Input name="activatedAt" type="date" defaultValue={order.activatedAt ?? ""} className="h-9" dir="ltr" />
          </Field>
          {/**
            * بدايةُ الاشتراك = يومُ وصول أوّل مقال (`serviceStartedAt`) — منه تُحسب النهاية.
            *
            * يُختم وحده حين يصل أوّلُ مقالٍ للعميل (`lib/orders/start-service-clock.ts`)، فلا
            * يُعدَّل في الطلب العاديّ. والمُرحَّل استثناء (خالد ٢٣ سبتمبر ٢٠٢٦: «خليها مرنة»):
            * مقالاتُه سُلّمت قبل النظام، فلا يعرف تاريخَها إلّا من يكتبه.
            */}
          {isMigrated ? (
            <Field label="بداية الاشتراك" hint="يوم أوّل مقال — طلب مُرحَّل">
              <Input
                name="serviceStartedAt"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
                dir="ltr"
              />
            </Field>
          ) : (
            <Field label="بداية الاشتراك" hint="تُسجَّل وحدها مع أوّل مقال">
              <input type="hidden" name="serviceStartedAt" value={order.serviceStartedAt ?? ""} />
              <ReadOnlyDate value={order.serviceStartedAt} empty="لم يصل أوّل مقال" />
            </Field>
          )}
          {/* النهايةُ تُحسب ولا تُكتب — بنفس حاسب جدول الطلبات، وتتحدّث مع الشهور والبداية. */}
          <Field
            label="نهاية الاشتراك"
            hint={paidNum > 0 ? `البداية + ${formatMonths(serviceMonths)}` : "تُحسب من البداية والشهور"}
          >
            <ReadOnlyDate value={endDate} empty="تُحسب بعد أوّل مقال" />
          </Field>
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
