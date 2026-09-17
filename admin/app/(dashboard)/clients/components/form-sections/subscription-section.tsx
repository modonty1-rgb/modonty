"use client";

import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

/**
 * **نسبةُ العميل — لا ماله.**
 *
 * كان هذا القسم يعرض بطاقاتِ أربع باقاتٍ بأسعارٍ حيّة من الكتالوج، ودورةَ فوترة، وعملةً
 * مشتقّةً من الدولة — كلّها يكتبها الموظّف بيده على الكرت. فصار للصفقة الواحدة رقمان:
 * ما دفعه العميل في الطلب، وما كُتب هنا بعده. والاثنان يفترقان مع أوّل تعديل.
 *
 * فالمال خرج إلى حيث هو مكتوب أصلاً:
 *   الباقة والسعر والمدّة  →  بطاقة «الاشتراك الحالي» (تبويب Overview) من الطلب الساري
 *   المسدَّد والمتأخّر      →  صفحة الحساب، من الفواتير
 *
 * وبقي هنا ما ليس مالاً: **من يتبعه** و**ما نوع حسابه**.
 */
interface SubscriptionSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  isEditMode?: boolean;
  salesReps?: Array<{ id: string; name: string }>;
}

export function SubscriptionSection({ form, salesReps = [] }: SubscriptionSectionProps) {
  const { watch, setValue, formState: { errors } } = form;
  const isInternal = watch("isInternal");
  const salesRepId = watch("salesRepId");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* المندوب يبقى: نسبةٌ لا مال. وهو يُنسخ من الطلب عند التفعيل، ويُصحَّح هنا
            للعملاء القدامى الذين سبقوا الطلبات. */}
        <Label className="text-xs font-bold whitespace-nowrap">مندوب المبيعات</Label>
        <Select value={salesRepId || undefined} onValueChange={(val) => setValue("salesRepId", val || null, { shouldValidate: true })}>
          <SelectTrigger className={`h-9 w-[200px] ${errors.salesRepId ? "border-destructive ring-1 ring-destructive/40" : ""}`}>
            <SelectValue placeholder="اختر المندوب…" />
          </SelectTrigger>
          <SelectContent>
            {salesReps.map((rep) => <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-2 border-t pt-3 md:grid-cols-2">
        {/* حسابٌ داخليّ — مجّانيّ بطبيعته، خارج كل فوترةٍ وتجديدٍ وعدّادِ مال. */}
        <button
          type="button"
          onClick={() => setValue("isInternal", !isInternal, { shouldDirty: true })}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-start transition-all ${
            isInternal ? "border-primary bg-primary/[0.07] ring-2 ring-primary/20" : "border-dashed border-input hover:border-primary/40"
          }`}
        >
          <span className="truncate text-[13px] font-bold">🏛️ حساب داخلي</span>
          <span className="ms-auto shrink-0 text-[10px] font-medium text-muted-foreground">مجاني</span>
        </button>

        <p className="flex items-center text-[11px] leading-relaxed text-muted-foreground">
          الباقة والسعر والمدّة تُقرأ من الطلب الساري في تبويب Overview — ولا تُكتب هنا.
        </p>
      </div>
    </div>
  );
}
