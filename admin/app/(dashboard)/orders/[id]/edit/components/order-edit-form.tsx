"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateOrderAction } from "../actions/update-order";

export interface OrderForEdit {
  id: string;
  number: string;
  buyerName: string;
  planName: string;
  planSlug: string;
  articlesPerMonth: number | null;
  market: string;
  currency: string;
  totalMinor: number;
  paidMonths: number;
  bonusServiceMonths: number;
  vatRateBp: number;
  serviceStartedAt: string | null;
  activatedAt: string | null;
  paidAt: string | null;
  notes: string | null;
}

/** «يحتاج مراجعة» يُكتب في `notes` بادئاً بـ⚠ — يُعرض بارزاً لا مدفوناً في مربّع نصّ. */
function ReviewBanner({ notes }: { notes: string | null }) {
  if (!notes?.startsWith("⚠")) return null;
  const parts = notes.replace(/^⚠\s*/, "").split(" · ");
  return (
    <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        هذا الطلب مُرحَّل ويحتاج مراجعة
      </div>
      <ul className="mt-1.5 space-y-0.5 text-[11px] text-amber-800 dark:text-amber-200">
        {parts.map((p) => (
          <li key={p}>• {p}</li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
        {hint && <span className="font-normal"> — {hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function OrderEditForm({ order, firstArticleAt }: { order: OrderForEdit; firstArticleAt: string | null }) {
  const [state, action, pending] = useActionState(updateOrderAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={order.id} />

      <ReviewBanner notes={order.notes} />

      {state?.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {state.error}
        </div>
      )}
      {state?.ok && !state.error && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          حُفظ التعديل وسُجّل في سجلّ التدقيق.
        </div>
      )}

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-sm font-bold">الباقة</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم الباقة">
            <Input name="planName" defaultValue={order.planName} maxLength={60} required />
          </Field>
          <Field label="سلَق الباقة" hint="المفتاح في رابط الدفع">
            <Input name="planSlug" defaultValue={order.planSlug} maxLength={60} required dir="ltr" />
          </Field>
          <Field label="الحصّة الشهريّة" hint="عدد المقالات">
            <Input name="articlesPerMonth" type="number" min={0} max={200} defaultValue={order.articlesPerMonth ?? ""} />
          </Field>
        </div>
      </section>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-sm font-bold">المال</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="السوق">
            <select name="market" defaultValue={order.market} className="h-9 rounded-md border bg-background px-2 text-sm">
              <option value="SA">السعودية</option>
              <option value="EG">مصر</option>
            </select>
          </Field>
          <Field label="العملة">
            <select name="currency" defaultValue={order.currency} className="h-9 rounded-md border bg-background px-2 text-sm">
              <option value="SAR">ريال سعودي</option>
              <option value="EGP">جنيه مصري</option>
            </select>
          </Field>
          <Field label="الإجمالي المحصَّل" hint="شاملاً الضريبة — كما دُفع فعلاً">
            <Input name="total" type="number" step="0.01" min={0} defaultValue={(order.totalMinor / 100).toString()} required dir="ltr" />
          </Field>
          <Field label="نسبة الضريبة" hint="نقطة أساس: ١٥٪ = 1500 · صفر = بلا ضريبة">
            <Input name="vatRateBp" type="number" min={0} max={10000} defaultValue={order.vatRateBp} dir="ltr" />
          </Field>
          <Field label="الشهور المدفوعة">
            <Input name="paidMonths" type="number" min={1} max={60} defaultValue={order.paidMonths} required dir="ltr" />
          </Field>
          <Field label="شهور الهدية">
            <Input name="bonusServiceMonths" type="number" min={0} max={24} defaultValue={order.bonusServiceMonths} dir="ltr" />
          </Field>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          السعر الشهريّ وقيمة الضريبة يُحسبان من الإجمالي والشهور — لا تُكتب يدويّاً كي لا تتناقض معه.
        </p>
      </section>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-sm font-bold">التواريخ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="بداية الخدمة" hint="منه تُعدّ المدّة">
            <Input name="serviceStartedAt" type="date" defaultValue={order.serviceStartedAt ?? ""} dir="ltr" />
          </Field>
          <Field label="يوم التفعيل">
            <Input name="activatedAt" type="date" defaultValue={order.activatedAt ?? ""} dir="ltr" />
          </Field>
          <Field label="يوم الدفع">
            <Input name="paidAt" type="date" defaultValue={order.paidAt ?? ""} dir="ltr" />
          </Field>
        </div>
        {/* أوّلُ مقالٍ يُحسب من المقالات نفسها ولا يُخزَّن هنا: تخزينُه يخلق رقماً ثانياً
            يكذب أوّلَ ما يُعدَّل مقال. يُعرض للقراءة كي يوازن المحاسبُ التواريخَ به. */}
        <div className="mt-3 rounded-md bg-muted/40 px-3 py-2 text-xs">
          <span className="text-muted-foreground">أوّل مقال سُلِّم لهذا العميل: </span>
          <b className="tabular-nums">{firstArticleAt ?? "لم يُسلَّم بعد"}</b>
          <span className="text-muted-foreground"> — محسوبٌ من المقالات، لا يُعدَّل هنا.</span>
        </div>
      </section>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-sm font-bold">الملاحظة</h2>
        <Textarea name="notes" rows={3} defaultValue={order.notes ?? ""} maxLength={1000} placeholder="سبب التعديل، أو ما تبقّى للمراجعة" />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          امسح الوسم ⚠ بعد ما تتأكّد من الأرقام — هو ما يميّز المُراجَع من غيره.
        </p>
      </section>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href={`/orders/${order.id}`}>إلغاء</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
          حفظ التعديل
        </Button>
      </div>
    </form>
  );
}
