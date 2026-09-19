"use client";

import type { UseFormReturn } from "react-hook-form";

import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";

import { Checkbox } from "@/components/ui/checkbox";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

/**
 * **خانةٌ واحدة تُوضع حيث ينفع قرارُها.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «في حاجات المفروض تكون في أماكن تانية، فأعِد التنسيق حسب
 * المنطق العمليّ».
 *
 * كانت الثلاثُ في قسمٍ اسمُه «الخيارات» — وهو اسمٌ لا يقول شيئاً: ما الذي يجمع
 * «مميّز» و«موثّق» و«يشوف المجدول» غيرَ أنّ كلاًّ منها مربّع؟ والشكلُ ليس تصنيفاً.
 * فتفرّقت كلٌّ إلى حيث يُتَّخذ قرارُها:
 *
 * - **موثَّق** → الرفُّ الأيمن تحت صورة التوثيق مباشرةً. الشارةُ والورقةُ التي تبرّرها
 *   فعلٌ واحد: تنظر إلى السجلّ ثمّ ترفع الخانة. وكانتا في عمودين متقابلين.
 * - **شريك مميّز** → بطاقة «Client Page». قرارُ عرضٍ عامّ: يضعه في سلايدر الشركاء
 *   على مدونتي — لا صفةَ حسابٍ ولا هويّة.
 * - **يشوف المجدول** → بطاقة «Account & Access». صلاحيّةٌ على دخوله هو: تفتح تبويباً
 *   في كونسوله، فمكانُها مع بريده وكلمته.
 *
 * والنصُّ يبقى في مكانٍ واحدٍ (`OPTIONS`) فلا يُكتب ثلاثَ مرّاتٍ في ثلاث بطاقات.
 */
const OPTIONS = {
  isFeatured: {
    emoji: "⭐",
    title: "شريك مميّز",
    hint: "يظهر في سلايدر «الشركاء المميّزون» على مدونتي، وبشارةٍ على بطاقته.",
  },
  /**
   * شهادةُ فحصٍ لا حقلُ بيانات: السجلّ التجاريّ وصورةُ التوثيق يدخلهما العميل، فوجودُهما
   * لا يعني أنّ أحداً راجعهما. تُوضع بعد الفحص، وهي وحدها مصدرُ شارة التوثيق على مدونتي.
   */
  isVerified: {
    /**
     * **علامةُ مدونتي الرسميّة لا إيموجي** (خالد ١٩ سبتمبر ٢٠٢٦: «استخدم الأيقونة
     * الرسميّة تبعتنا»).
     *
     * و`VerifiedBadge` يقول في توثيقه إنّ هذا الادّعاء نفسَه رُسم ثلاثَ مرّاتٍ بثلاثة
     * أشكال، فوُحِّد في «M داخل درع» — فإيموجي رابعٌ هنا يعيد الانقسام الذي أُغلق.
     * وهي أيضاً ما يراه الزائرُ على صفحة العميل، فالشاشةُ التي تمنحها ترسمها كما تُرى.
     */
    icon: "verified" as const,
    emoji: "✅",
    title: "موثَّق",
    hint: "فحصنا أوراقه الرسميّة. الشارةُ تظهر في القائمة والبحث وصفحة الشريك.",
  },
  /**
   * إغلاقُه يُخفي تبويب «مجدولة» من صفحة مقالاته — للعميل الذي يقرأ تاريخاً غيرَ منشورٍ
   * وعداً لم نقطعه بعد.
   */
  showSchedule: {
    emoji: "🗓️",
    title: "يشوف المجدول",
    hint: "تبويب «مجدولة» في حساب العميل — ما جُدول ولم يُنشر بعد.",
  },
} as const;

/** القيمةُ الافتراضيّة حين لا تكون مكتوبةً بعد — «مميّز» وحده يبدأ مغلقاً. */
const FALLBACK = { isFeatured: false, isVerified: true, showSchedule: true } as const;

export function ClientOption({
  form,
  name,
}: {
  form: UseFormReturn<ClientFormSchemaType>;
  name: keyof typeof OPTIONS;
}) {
  const meta = OPTIONS[name];
  const checked = (form.watch(name) as boolean | undefined) ?? FALLBACK[name];

  return (
    // الأثرُ في `title` لا في سطرٍ تحته (خالد ١٩ سبتمبر ٢٠٢٦: «الـhint اللي تحتها ما نحتاجه»).
    <label
      title={meta.hint}
      className="flex cursor-pointer items-center gap-2 text-[13px] font-medium"
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(c) => form.setValue(name, c === true, { shouldDirty: true })}
      />
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        {"icon" in meta ? <VerifiedBadge className="size-4" /> : <span aria-hidden>{meta.emoji}</span>}
        {meta.title}
      </span>
    </label>
  );
}
