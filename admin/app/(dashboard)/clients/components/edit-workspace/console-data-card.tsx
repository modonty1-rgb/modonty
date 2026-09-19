"use client";

import { CheckCircle2, CircleDashed } from "lucide-react";

import { OpenClientConsoleButton } from "./open-client-console-button";

/**
 * **ما أدخله العميلُ بنفسه — نقرؤه ولا نكتبه.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «محتاجين كرت يعرض المعلومات اللي موجودة في الكونسول… اللي
 * تهمّ الأدمن».
 *
 * ── لماذا احتجناه اليوم بالذات ──
 * خرجت من شاشتنا ستّةُ حقولٍ إلى الكونسول (الموقع · الهاتف · نوع التواصل · الحسابات ·
 * مستوى الأسعار · ملفّ جوجل)، وكان العميلُ يملك قبلها سبعةَ عشرَ غيرَها. فصار أكثرُ
 * ملفّه مكتوباً حيث لا نراه — ومن يتابع عميلاً لا يعرف ما ينقصه ليطالبه به.
 *
 * ── وهو عرضٌ لا تحرير ──
 * لا حقلَ ولا زرَّ حفظ: ما يُكتب هنا يصير مصدراً ثانياً للحقيقة، والحقولُ خرجت أصلاً
 * لأنّ صاحبَها أعرفُ بها. والصفُّ الناقصُ يُعرض رماديّاً لا يُخفى — الغيابُ معلومةٌ
 * للمتابع، وإخفاؤه يخفي العمل.
 *
 * ── وبابُ الكونسول هنا ──
 * خالد (١٩ سبتمبر ٢٠٢٦): «الزرّ اللي هو Open Client Console نقدر نحطّها في الكرت اللي
 * يخصّ الكونسول». وكان في الشريط السفليّ بين «احفظ» و«اختر الكاتب» — فعلٌ يفتح تبويباً
 * آخر بجانب أفعالٍ تكتب في هذا. وهنا يقع حيث يُسأل عنه: تقرأ ما نقص، فتفتح حسابَه لترى.
 *
 * ── وبلا رابطٍ إلى الوثائق ──
 * خالد (١٩ سبتمبر ٢٠٢٦): «صار في مكانين — شيله من كرت الكونسول». وبابُ الوثائق في
 * بطاقة الشاشات بالرفّ الأيمن مع أخوَيه؛ ورابطٌ ثانٍ إليه يجعل العينَ تسأل: أيُّهما
 * غيرُ الآخر؟ ويبقى **عددُها** هنا لأنّه معلومةٌ لا بابٌ — سطرٌ في جرد ما أدخله.
 *
 * ── وما اختير للعرض ──
 * ما يُسأل عنه عملاً: هويّتُه القانونيّة (الاسم · السجلّ · الضريبة) لأنّها شرطُ التوثيق،
 * وعنوانُه لأنّه يبني `LocalBusiness`، ووصفُه لأنّه يغذّي السيو، وقنواتُه لأنّها ما
 * يضغطه الزائر. وما لا يُسأل عنه (الشعار النصّيّ · الاسم البديل) لا يُعرض.
 */
export type ConsoleData = {
  legalName?: string | null;
  commercialRegistrationNumber?: string | null;
  vatID?: string | null;
  foundingDate?: Date | string | null;
  addressCity?: string | null;
  addressRegion?: string | null;
  addressStreet?: string | null;
  description?: string | null;
  phone?: string | null;
  url?: string | null;
  priceRange?: string | null;
  gbpProfileUrl?: string | null;
  sameAs?: string[] | null;
  openingHoursSpecification?: unknown;
  documentsCount: number;
  clientId: string;
};

const PRICE_LABEL: Record<string, string> = {
  $: "اقتصاديّ",
  $$: "متوسّط",
  $$$: "مرتفع",
  $$$$: "فاخر",
};

export function ConsoleDataCard(d: ConsoleData) {
  const address = [d.addressCity, d.addressRegion, d.addressStreet].filter(Boolean).join(" · ");
  const hours = Array.isArray(d.openingHoursSpecification) ? d.openingHoursSpecification.length : 0;
  const founding = d.foundingDate ? new Date(d.foundingDate).getFullYear().toString() : null;
  const socials = d.sameAs?.filter(Boolean).length ?? 0;

  const rows: { label: string; value: string | null }[] = [
    { label: "الاسم القانونيّ", value: d.legalName?.trim() || null },
    { label: "السجلّ التجاريّ", value: d.commercialRegistrationNumber?.trim() || null },
    { label: "الرقم الضريبيّ", value: d.vatID?.trim() || null },
    { label: "سنة التأسيس", value: founding },
    { label: "العنوان", value: address || null },
    { label: "الوصف", value: d.description?.trim() ? `${d.description.trim().length} حرفاً` : null },
    { label: "ساعات العمل", value: hours ? `${hours} أيّام` : null },
    { label: "الهاتف", value: d.phone?.trim() || null },
    { label: "الموقع", value: d.url?.trim() ? "مكتوب" : null },
    { label: "الحسابات", value: socials ? `${socials}` : null },
    { label: "مستوى الأسعار", value: d.priceRange ? (PRICE_LABEL[d.priceRange] ?? d.priceRange) : null },
    { label: "ملفّ جوجل", value: d.gbpProfileUrl?.trim() ? "مربوط" : null },
    { label: "الوثائق", value: d.documentsCount ? `${d.documentsCount}` : null },
  ];

  const filled = rows.filter((r) => r.value).length;

  return (
    <aside dir="rtl" className="space-y-2.5 rounded-lg border bg-card p-3">
      {/**
        * الترويسةُ سطرٌ واحد: العنوانُ والعدّادُ وبابُ الكونسول.
        *
        * خالد (١٩ سبتمبر ٢٠٢٦): «ارفع الزرَّ في الهيدر فوق، بدل الحشو الزائد اللي ماله
        * داعي». وكان تحتها سطرٌ يشرح «يُدخلها العميلُ من حسابه» — والعنوانُ «من الكونسول»
        * يقوله، والعدّادُ يقول البقيّة. وشرحٌ يكرّر عنوانَه يُقرأ مرّةً ثمّ يُتخطّى دائماً.
        */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-baseline gap-1.5 text-[12px] font-bold">
          من الكونسول
          {/* العدّادُ مع العنوان: من يتابع عميلاً يسأل «كم ينقصه؟» قبل «ما الناقص؟». */}
          <span className="text-[11px] font-normal tabular-nums text-muted-foreground">
            {filled}/{rows.length}
          </span>
        </h2>
        <OpenClientConsoleButton clientId={d.clientId} compact />
      </div>

      <dl className="space-y-0.5 border-t pt-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-2 py-0.5 text-[11px]">
            <dt className="flex shrink-0 items-center gap-1 text-muted-foreground">
              {r.value ? (
                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" aria-hidden />
              ) : (
                <CircleDashed className="size-3 text-muted-foreground/50" aria-hidden />
              )}
              {r.label}
            </dt>
            <dd className={`min-w-0 truncate ${r.value ? "font-medium" : "text-muted-foreground/50"}`}>
              {r.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
