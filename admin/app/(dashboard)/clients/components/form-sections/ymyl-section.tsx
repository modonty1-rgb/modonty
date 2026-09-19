"use client";

/**
 * **YMYL — بطاقةُ رفٍّ لا قسمُ نموذج.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «الـYMYL هذي شيلها من هنا وحطّها في العمود اللي فيه الـside
 * bar اللي فيه الـnavigation. وشوف ترتيب منطقيّ ومناسب لها، وتصميم مناسب وجيّد لها».
 *
 * -- لماذا الرفُّ موضعُها الصحيح --
 * الأدمن لا يملك هنا إلّا قرارين: **أهو YMYL؟** و**أيُّ تصنيف؟** أمّا حقولُ التوثيق
 * نفسُها (رقمُ الرخصة · الجهة · التخصّص · الصورة) فيدخلها العميلُ من الكونسول. فقسمٌ
 * بعرض النموذج لقرارين يوهم بأنّ فيه ما يُملأ، وهو في الحقيقة **بوّابةُ نشرٍ**: تقول
 * هل تُنشر مقالاتُه بلا مراجعٍ مؤهّلٍ أم لا. والبوّاباتُ تُقرأ بطرف العين كالحالة، لا
 * تُفتح كالحقول.
 *
 * -- والترتيب: قرارٌ ثمّ فرعُه ثمّ نتيجتُه --
 * الخانة (أهو YMYL؟) → التصنيف (يبقى ظاهراً معطَّلاً حتّى تُرفع الخانة، خالد نفسُ
 * اليوم: «خلّيها ظاهرة، ولكن disable لو ما في check») → حالُ إكمال العميل. وكانت شبكةَ
 * ثلاثِ بطاقاتٍ عرضيّةٍ لكلٍّ وصفُها؛ وفي رفٍّ عرضُه ٢٤٠px صارت قائمةً رأسيّة، والوصفُ
 * في `title` — كما صارت خياراتُ الحساب في نفس اليوم.
 */

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

import {
  YMYL_CATEGORIES,
  type YmylCategory,
} from "@modonty/shared/lib/seo/ymyl-config";

import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

export function YmylSection({ form }: { form: UseFormReturn<ClientFormSchemaType> }) {
  const { watch, setValue } = form;

  const isYmyl = watch("isYmyl") ?? false;
  const category = watch("ymylCategory") as YmylCategory | null | undefined;
  const ymylData = (watch("ymylData") ?? {}) as Record<string, unknown>;

  const config = useMemo(() => (category ? YMYL_CATEGORIES[category] : null), [category]);

  // قراءةٌ فقط: كم حقلاً إلزاميّاً أكمل العميلُ من الكونسول.
  const completion = useMemo(() => {
    if (!config) return null;
    const required = config.fields.filter((f) => f.required);
    const filled = required.filter((f) => {
      const v = ymylData[f.key];
      return v !== undefined && v !== null && v !== "";
    });
    return { total: required.length, filled: filled.length, complete: filled.length === required.length };
  }, [config, ymylData]);

  function pickCategory(next: YmylCategory) {
    // تغييرُ التصنيف يمسح `ymylData`: شكلُ الحقول القديم لا يناسب التصنيف الجديد.
    if (category && category !== next) {
      setValue("ymylData", {}, { shouldValidate: true, shouldDirty: true });
    }
    setValue("ymylCategory", next, { shouldValidate: true, shouldDirty: true });
  }

  function toggle(checked: boolean) {
    setValue("isYmyl", checked, { shouldValidate: true, shouldDirty: true });
    if (!checked) {
      setValue("ymylCategory", null, { shouldValidate: true, shouldDirty: true });
      setValue("ymylData", null, { shouldValidate: true, shouldDirty: true });
    }
  }

  return (
    <div dir="rtl" className="divide-y rounded-lg border bg-card">
      {/* ① القرار. */}
      <label className="flex cursor-pointer items-start gap-2 p-3 transition-colors hover:bg-accent/40">
        <Checkbox checked={isYmyl} onCheckedChange={(c) => toggle(c === true)} className="mt-0.5" />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-[12.5px] font-semibold">
            <ShieldAlert className="size-3.5 text-amber-500" aria-hidden />
            عميل YMYL
          </span>
          <span className="mt-0.5 block text-[10.5px] leading-snug text-muted-foreground">
            يحجب النشرَ حتّى يكتمل المراجعُ والرخصة.
          </span>
        </span>
      </label>

      {/* ② فرعُ القرار — ظاهرٌ معطَّلٌ قبل رفع الخانة، فيُقرأ ما تفتحه قبل فتحه. */}
      <div className={`p-3 ${isYmyl ? "" : "pointer-events-none opacity-45"}`} aria-disabled={!isYmyl}>
        <p className="mb-1.5 text-[10.5px] font-medium text-muted-foreground">
          التصنيف{!isYmyl && " — فعّل الخانة أوّلاً"}
        </p>
        <div className="space-y-1">
          {(Object.keys(YMYL_CATEGORIES) as YmylCategory[]).map((key) => {
            const cfg = YMYL_CATEGORIES[key];
            const selected = isYmyl && category === key;
            return (
              <button
                key={key}
                type="button"
                disabled={!isYmyl}
                onClick={() => pickCategory(key)}
                title={cfg.description.ar}
                className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-start transition-all disabled:cursor-not-allowed ${
                  selected
                    ? "border-primary bg-primary/[0.07] ring-1 ring-primary/25"
                    : "border-border enabled:hover:border-primary/40 enabled:hover:bg-muted/40"
                }`}
              >
                <span
                  className={`size-3 shrink-0 rounded-full border-2 ${
                    selected ? "border-primary bg-primary" : "border-muted-foreground/50"
                  }`}
                />
                <span className="truncate text-[12px] font-medium">{cfg.label.ar}</span>
                <span className="ms-auto shrink-0 text-[10px] text-muted-foreground">{cfg.label.en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ③ نتيجةُ القرار — ما أكمله العميلُ من الكونسول، قراءةً لا تحريراً. */}
      {isYmyl && config && completion && (
        <div className="p-3">
          <div
            className={`flex items-start gap-2 rounded-lg border p-2.5 ${
              completion.complete
                ? "border-emerald-500/30 bg-emerald-500/[0.08]"
                : "border-amber-500/30 bg-amber-500/[0.08]"
            }`}
          >
            {completion.complete ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            ) : (
              <Clock className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            )}
            <span className="min-w-0">
              <span
                className={`block text-[11.5px] font-semibold ${
                  completion.complete
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {completion.complete ? "أكمل العميلُ التوثيق" : "بانتظار العميل"}
                <span className="ms-1 tabular-nums">
                  {completion.filled}/{completion.total}
                </span>
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                {completion.complete
                  ? "يُنشر مع مراجعٍ مرفق."
                  : "يُدخلها العميلُ من الكونسول — ولا يُنشر قبلها."}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
