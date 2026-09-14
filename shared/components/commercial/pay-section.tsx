import type { ReactNode } from "react";
import Link from "next/link";

import { formatMonths } from "../../lib/commercial/arabic-months";
import type { MarketCatalog, CatalogTerm } from "../../lib/commercial/get-market-catalog";
import type { PaySectionContent } from "../../lib/commercial/get-pay-section-content";
import { cx } from "../../lib/cx";
import { PlanCard } from "./plan-card";

/**
 * قسم البيع كاملاً — صفّ المدد · الإعلان · العنوان · البطاقات · شريط الثقة.
 *
 * لماذا القسم كلّه مشترك لا البطاقة وحدها (خالد ١٣ سبتمبر ٢٠٢٦): «نفس الكومبوننت اللي
 * حتشتغلها هنا هي نفس اللي في الصفحة الرئيسية، عشان أي تعديل هنا يأثر هناك وأتأكد مليون
 * في المئة». البطاقة كانت مشتركة، لكن ما حولها كان مكتوباً في شاشة الأدمن وحدها — فكانت
 * `/pay` ستعيد بناءه، وتتباعد النسختان عند أوّل تعديل. الآن الشاشتان تستدعيان هذا الملفّ،
 * فالمعاينة ليست شبيهةً بصفحة البيع: هي هي.
 *
 * ما يبقى لكل تطبيق: شكل الرابط (`termHref`) لأن العنوان يختلف بينهما، وحالة الزرّ
 * (`ctaDisabled`) لأن المعاينة لا تبيع. وما عدا ذلك مشترك بالكامل.
 */

const ar = new Intl.NumberFormat("ar-SA");

/**
 * نصّ خانة المدّة وشارتها — بصياغة جبر سيو حرفياً بطلب خالد (١٣ سبتمبر ٢٠٢٦: «اعمل الثقل
 * تبع الأشهر نفس الشيء»). هو يكتبها بالعامّية المألوفة: «٣ شهور · ٦ شهور · ١٢ شهر»
 * و«شهر مجاني»، لا بالفصحى التي يخرّجها `formatMonths` («٣ أشهر · ١٢ شهراً»).
 *
 * الفصحى أصحّ نحواً، والعامّية هي المقروءة في صفحة بيع سعودية — والقرار قرار خالد.
 * ويبقى `formatMonths` على حاله في بقيّة البطاقة (أشهر الخدمة والهدية داخل السعر).
 */
function termTabLabel(paidMonths: number): string {
  if (paidMonths >= 11) return `${ar.format(paidMonths)} شهر`;
  return `${ar.format(paidMonths)} شهور`;
}

function bonusBadgeLabel(bonusMonths: number): string {
  return bonusMonths === 1 ? "شهر مجاني" : `${ar.format(bonusMonths)} شهور مجاناً`;
}

export interface PaySectionProps {
  catalog: MarketCatalog;
  content: PaySectionContent;
  selectedTerm: CatalogTerm | null;
  /** رابط اختيار المدّة — يبنيه كل تطبيق بعنوانه (PAY-G10 يحسم اسم البارامتر). */
  termHref: (paidMonths: number) => string;
  /** السطر الضريبي — ادّعاءٌ عن قانون سوق يقرّره المستدعي (PAY-UNKNOWN #5). */
  priceNote: string | null;
  ctaLabel: string;
  /** المعاينة تمرّر true: تُرى ولا تبيع. */
  ctaDisabled?: boolean;
  /**
   * وجهة الشراء لباقةٍ ومدّة. تُبنى في كل تطبيق لأن العنوان يختلف — المعاينة لا تمرّرها
   * فتبقى أزرارها معطَّلة، وصفحة البيع تمرّرها فتصير روابط حقيقية إلى صفحة الدفع.
   */
  ctaHref?: (planSlug: string, paidMonths: number) => string;
  installmentHref?: (planSlug: string, paidMonths: number) => string;
  /** «قسّطها على دفعات» — يقرّره المستدعي لأن تمارا سعودية فقط (PAY-D6). */
  installmentLabel?: string | null;
  refundNote?: string | null;
  payMarks?: { src: string; alt: string }[];
  installmentMark?: { src: string; alt: string } | null;
  /** حاشية أسفل الشبكة: «الدفع بالبطاقة عبر بوابة معتمدة…». */
  paymentFootnote?: React.ReactNode;
  /** لا شيء منشور — كل تطبيق يقول ذلك بلغته (زائرٌ لا يُقال له «انشر باقة»). */
  emptyState?: ReactNode;
}

export function PaySection({
  catalog,
  content,
  selectedTerm,
  termHref,
  priceNote,
  ctaLabel,
  ctaDisabled = false,
  ctaHref,
  installmentHref,
  installmentLabel = null,
  refundNote = null,
  payMarks = [],
  installmentMark = null,
  paymentFootnote = null,
  emptyState = null,
}: PaySectionProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      {catalog.terms.length > 0 ? (
        /**
         * مبدّل مقسّم (segmented) لا ثلاثة أزرار منفصلة: المدد خيارٌ واحد من ثلاثة، وشكلُ
         * الثلاثة داخل حاضنة واحدة يقول ذلك بلا نصّ. والمختار يرتفع بسطح فاتح وظلّ — لا
         * يُقلب لوناً كاملاً، كي لا ينافس زرّ الشراء على الانتباه وهو ليس الهدف.
         *
         * سطران في كل خانة: المدّة فوق والهدية تحتها. سطرٌ واحد طويل («١٢ شهراً + ٦ أشهر
         * مجاناً») يُقرأ ككتلة فتضيع الهدية داخله — وهي أقوى ما في العرض.
         */
        <div className="pt-2">
          <div
            className="mx-auto grid w-full max-w-96 rounded-[14px] bg-muted p-1.5 text-sm font-medium"
            role="tablist"
            aria-label="مدة الاشتراك"
            style={{ gridTemplateColumns: `repeat(${catalog.terms.length}, minmax(0, 1fr))` }}
          >
            {catalog.terms.map((term) => {
              const isActive = term.paidMonths === selectedTerm?.paidMonths;
              return (
                <Link
                  key={term.paidMonths}
                  href={termHref(term.paidMonths)}
                  // `Link` لا `<a>`: الوسم العادي يُعيد تحميل الصفحة كاملةً عند كل تبديل
                  // مدّة — وميضٌ وفقدُ موضع التمرير في أكثر عنصر يُضغط في صفحة بيع.
                  // و`scroll={false}` يُبقي العين على البطاقات بدل القفز إلى الأعلى.
                  scroll={false}
                  aria-current={isActive ? "true" : undefined}
                  role="tab"
                  aria-selected={isActive}
                  className={cx(
                    "relative rounded-[11px] px-2 py-3 text-center text-[15px] font-bold",
                    // حلقة الخانة صريحة أيضاً: الافتراضية ٠٫٦٧px بلون قاتم، تختفي على
                    // السطح الداكن. والمدّة أوّل ما يُضغط في الصفحة (WCAG 2.4.7).
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "bg-card text-foreground shadow-[0_1px_3px_color-mix(in_oklch,var(--foreground)_8%,transparent)]"
                      : "bg-transparent text-muted-foreground",
                  )}
                >
                  {termTabLabel(term.paidMonths)}
                  {/* شارة واحدة لكل خانة، تقول **الهدية** لا رأياً. حين كانت خانة تحمل
                      «الأنسب» وأخرى تحمل عرضاً، صارت الخانتان موسومتين على مقياسين
                      مختلفين — توصيةٌ مقابل عرض — ولا تُقارنان بالثالثة العارية. بالهدية
                      تصطفّ الثلاث على مقياس واحد: لا شيء · شهر · ستّة. وحقيقةٌ يتحقّق
                      منها القارئ أقوى من كلمة تملي عليه ما يفضّل.
                      ولونان: الموصى بها بلون العلامة، وغيرها بلون العرض — فالتوصية
                      تُقرأ من اللون بلا كلمة إضافية. */}
                  {term.bonusServiceMonths > 0 ? (
                    <span
                      className={cx(
                        "absolute -top-2.5 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold rtl:translate-x-1/2",
                        term.isRecommended ? "bg-primary text-primary-foreground" : "bg-star text-foreground",
                      )}
                    >
                      {bonusBadgeLabel(term.bonusServiceMonths)}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ما لم يُكتب في الأدمن لا يُرسم مكانه فراغ (PAY-G13). */}
      {content.announcement ? (
        <p className="rounded-lg border border-dashed px-4 py-2 text-center text-sm font-semibold">{content.announcement}</p>
      ) : null}

      {content.headline || content.subheadline ? (
        <div className="text-center">
          {content.headline ? <h2 className="text-xl font-extrabold">{content.headline}</h2> : null}
          {content.subheadline ? <p className="mt-1 text-sm text-muted-foreground">{content.subheadline}</p> : null}
        </div>
      ) : null}

      {catalog.plans.length === 0 ? (
        emptyState
      ) : (
        <div className="grid gap-6 pt-6 md:grid-cols-2 xl:grid-cols-3">
          {catalog.plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              term={selectedTerm}
              priceNote={priceNote}
              ctaLabel={ctaLabel}
              ctaDisabled={ctaDisabled}
              ctaHref={ctaHref && selectedTerm ? ctaHref(plan.slug, selectedTerm.paidMonths) : null}
              installmentHref={installmentHref && selectedTerm ? installmentHref(plan.slug, selectedTerm.paidMonths) : null}
              installmentLabel={installmentLabel}
              refundNote={refundNote}
              payMarks={payMarks}
              installmentMark={installmentMark}
            />
          ))}
        </div>
      )}

      {/* الحاشية تُقرأ بعد القرار لا قبله — فموضعها تحت الشبكة، والعلامات تبقى على
          الأزرار التي تستعملها. */}
      {paymentFootnote}

      {content.trustItems.length > 0 ? (
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
          {content.trustItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
