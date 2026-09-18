import type { ReactNode } from "react";
import { vatRateBpForMarket } from "../../lib/payments/vat-rate";
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
  /** شريحة الباقة القادمة من جدول المقارنة في الأوفرفيو — تُحاط بحلقة وتُعطى مرساة. */
  highlightPlanSlug?: string | null;
  /** `h1` افتراضاً — يُنزَّل إلى `h2` في شاشةٍ تحمل عنوانها الخاصّ (معاينة الأدمن). */
  headingLevel?: "h1" | "h2";
  /** رابط جدول المقارنة — يُمرَّر حين توجد صفحةٌ تحمله. */
  compareHref?: string | null;
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
  highlightPlanSlug = null,
  headingLevel = "h1",
  compareHref = null,
}: PaySectionProps) {
  /**
   * **«شامل الضريبة» تظهر حيث توجد ضريبة** — لا حيث يوجد نصّ.
   *
   * كان الشرط وجودَ `priceNote` (نصٌّ يُحرَّر من الأدمن)، فظهرت على بطاقات السوق المصريّ
   * وضريبتُه صفر منذ ١٥ سبتمبر ٢٠٢٦ (`shared/lib/payments/vat-rate.ts` — المؤسّسة سعوديّة
   * وليست مسجَّلةً ضريبيّاً في مصر). مقيسٌ حيّاً ١٩ سبتمبر على `/eg/plans`:
   * «٧٬١٩٤ ج.م شامل الضريبة».
   *
   * وإعلانُ ضريبةٍ لا تُحصَّل ولا تُورَّد أسوأ من إغفال السطر — وهو نفسُ ما صُحِّح في
   * شاشة إنشاء الطلب بالأدمن في اليوم نفسه.
   */
  const marketHasVat = vatRateBpForMarket(catalog.market) > 0;

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
          <nav
            /* حدٌّ على الشريط (قياس ١٤ سبتمبر ٢٠٢٦): `bg-muted` يُخرج rgb(245,245,245)
               وخلفية الصفحة rgb(243,243,241) — نسبتهما **١٫٠١:١**، فالشريط غير مرئيّ
               أصلاً ولا يُقرأ عنصرَ تحكّمٍ بل نصّاً متناثراً. والحدّ يجعله مجموعةً واحدة. */
            className="mx-auto grid w-full max-w-96 rounded-[14px] border border-foreground/15 bg-muted p-1.5 text-sm font-medium"
            /* `nav` لا `tablist` (قياس ١٤ سبتمبر ٢٠٢٦): الأدوار كانت تَعِد قارئ الشاشة
               بلوحاتٍ تُبدَّل بالأسهم — و`aria-controls` كان `null` و`role="tabpanel"` صفراً.
               والواقع ثلاثة روابط تنقل الصفحة، فـ`nav` + `aria-current` يصفها كما هي. */
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
                  aria-current={isActive ? "page" : undefined}
                  className={cx(
                    "relative rounded-[11px] px-2 pb-3 pt-6 text-center text-[15px] font-bold",
                    // حلقة الخانة صريحة أيضاً: الافتراضية ٠٫٦٧px بلون قاتم، تختفي على
                    // السطح الداكن. والمدّة أوّل ما يُضغط في الصفحة (WCAG 2.4.7).
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      // الخانة المختارة: سطحٌ وحدٌّ وظلّ معاً. السطح وحده كان
                      // rgb(255,255,255) على شريطٍ rgb(245,245,245) — **١٫٠٥:١**، أي أن
                      // «المختارة» لم تكن تُرى مختارةً في الوضع الفاتح. والحدّ يرفعها فوق
                      // حدّ WCAG 1.4.11 (٣:١)، والظلّ يعطيها الارتفاع.
                      ? "bg-card text-foreground border border-foreground/25 shadow-[0_1px_2px_rgba(0,0,0,.06),0_4px_10px_-4px_rgba(14,6,90,.25)]"
                      : "border border-transparent bg-transparent text-muted-foreground",
                  )}
                >
                  {termTabLabel(term.paidMonths)}
                  {/* الهدية شارةٌ صغيرة في **جنب** الخانة لا في وسط حافّتها (خالد ١٤
                      سبتمبر ٢٠٢٦). المركزية كانت تتّسع أعرض من خانتها فتركب جارتها
                      وتُقصّ («٦ شهور مجاناً» قُصّت فعلاً)، والجنب يترك لها مهرباً.
                      و٩٫٥px بحشوةٍ ضيّقة: هي حاشيةٌ على المدّة لا عنوانٌ ينافسها. */}
                  {term.bonusServiceMonths > 0 ? (
                    <span
                      className={cx(
                        "pointer-events-none absolute top-1 end-1 whitespace-nowrap rounded-full px-1.5 py-[1px] text-[9.5px] font-normal leading-[1.5]",
                        /* `action-save-foreground` لا `foreground` على الكهرماني (قياس ١٥ سبتمبر ٢٠٢٦).
                           خلفية الشارة `--star` كهرمانيّة في السمتين، بينما `--foreground` ينقلب —
                           فصار النصّ أبيض على كهرماني في الداكن: **١٫٨٣:١** (يلزم ٤٫٥:١).
                           و`--action-save-foreground` معرَّف navy في `:root` و`.dark` معاً — أي
                           لا ينقلب، لأنه صُمِّم لنصٍّ يجلس على سطحٍ ثابت اللون. النتيجة ٨٫٨١:١
                           فاتحاً و٨٫٥٤:١ داكناً. */
                        term.isRecommended ? "bg-primary text-primary-foreground" : "bg-star text-action-save-foreground",
                      )}
                    >
                      {bonusBadgeLabel(term.bonusServiceMonths)}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}

      {/* ما لم يُكتب في الأدمن لا يُرسم مكانه فراغ (PAY-G13). */}
      {content.announcement ? (
        <p className="rounded-lg border border-dashed px-4 py-2 text-center text-sm font-semibold">{content.announcement}</p>
      ) : null}

      {content.headline || content.subheadline ? (
        <div className="text-center">
          {/* `h1` لا `h2` (قياس ١٤ سبتمبر ٢٠٢٦: الصفحة كانت بلا `h1` إطلاقاً).
              عنوان الصفحة هو هذا، وقارئ الشاشة يقفز إليه أوّلاً — وبلا رأسٍ من المستوى
              الأوّل يبدأ من لا شيء. ويصير مستوى البطاقات `h2` تحته فتكتمل الشجرة.
              والمستدعي الذي يملك `h1` خاصّاً به يمرّر `headingLevel="h2"`. */}
          {content.headline ? (
            headingLevel === "h2"
              ? <h2 className="text-xl font-extrabold">{content.headline}</h2>
              : <h1 className="text-xl font-extrabold">{content.headline}</h1>
          ) : null}
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
              priceNote={marketHasVat ? priceNote : null}
              ctaLabel={ctaLabel}
              ctaDisabled={ctaDisabled}
              ctaHref={ctaHref && selectedTerm ? ctaHref(plan.slug, selectedTerm.paidMonths) : null}
              installmentHref={installmentHref && selectedTerm ? installmentHref(plan.slug, selectedTerm.paidMonths) : null}
              installmentLabel={installmentLabel}
              installmentMark={installmentMark}
              anchorId={`plan-${plan.slug}`}
              highlighted={highlightPlanSlug === plan.slug}
            />
          ))}
        </div>
      )}

      {/* وعد الاسترداد مرّة واحدة تحت الشبكة لا في كل بطاقة (خالد ١٤ سبتمبر ٢٠٢٦).
          كان يُطبع ثلاث مرّات في ثلاث بطاقات، والوعد المكرّر يفقد ثقله ويصير ضجيجاً —
          وهو أصلاً يخصّ الاشتراك كلّه لا باقةً بعينها، فتكراره يوحي بأنه شرطٌ لكل واحدة
          على حدة. وموضعه بعد الشبكة: يُقرأ بعد المقارنة، حين يتردّد لا حين يوازن. */}
      {compareHref ? (
        /* من وصل إلى الأسعار وتردّد بين باقتين لا سبيل له للمقارنة إلا الرجوع إلى
           الأوفرفيو — والرجوع خروجٌ من صفحة الشراء. سطرٌ واحد يعيده إلى الجدول. */
        <p className="pt-1 text-center">
          <a
            href={compareHref}
            className="inline-flex h-11 items-center rounded-lg px-3 text-[13px] font-bold text-foreground underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            قارن الباقات ميزةً بميزة
          </a>
        </p>
      ) : null}

      {refundNote || (marketHasVat && priceNote) ? (
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1 text-[12px] font-medium text-muted-foreground">
          {refundNote ? (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>✓</span>
              {refundNote}
            </span>
          ) : null}
          {/* نصّ الضريبة الكامل مرّة واحدة: البطاقة تحمل «شامل الضريبة» ملتصقة بالرقم
              (وهو ما يلزم عند السعر)، والنسبة وصياغتها الرسمية تكفي هنا مرّة. */}
          {marketHasVat && priceNote ? <span>{priceNote}</span> : null}
        </p>
      ) : null}

      {/* شعارات الدفع مرّة واحدة تحت الشبكة (خالد ١٤ سبتمبر ٢٠٢٦).
          كانت تتكرّر في ذيل كل بطاقة — ومدى وفيزا وماستركارد **واحدة في الباقات الثلاث**
          فليست فرقاً بينها، مثل وعد الاسترداد وسطر الضريبة تماماً.
          ولا تُرفع فوق الشبكة: الشعارات طمأنينة، والطمأنينة تُقرأ عند التردّد لا قبل
          المقارنة — ففوق تصير زينةً تؤخّر وصوله إلى الأسعار. وهنا تلتحق بجملتها في
          `paymentFootnote` («الدفع بالبطاقة عبر بوابة معتمدة…») فيقرأ النصّ والشعار معاً.
          أمّا شعار التقسيط فبقي داخل زرّه: هناك يقول من يموّل، لا من يقبل البطاقات. */}
      {payMarks.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-[12px] font-medium text-muted-foreground">الدفع عبر</span>
          {payMarks.map((m) => (
            /* ⚠ **الاستثناء الوحيد من التوكنات في هذا المكوّن، ومقصود.** شعارات مدى وفيزا
              وماستركارد وتمارا علاماتٌ تجارية بألوان ثابتة مصمَّمة على أرضيّة فاتحة —
              على سطحٍ داكن تختفي أو تنقلب. فالأرضيّة بيضاء في السمتين، كما تفعل
              Stripe وShopify، وهو نفس منطق إطار البطاقة في `CardField`.

              والحدّ وحده يتبع التوكن: `ring-black/5` كان يُخرج rgb(242,242,242)
              و**١٫٠٠:١** ضدّ البطاقة الفاتحة — أي شريحةٌ بيضاء بلا حافّة على سطحٍ
              أبيض. و`foreground/50` يُخرج ٣٫١٩:١ فاتحاً (فوق حدّ WCAG 1.4.11) ويخفّ
              في الداكن حيث البياض نفسه يكفي للفصل (١٨٫٢:١). */
            <span key={m.src} className="flex h-6 items-center rounded bg-white px-1.5 ring-1 ring-foreground/50 dark:ring-foreground/20">
              {/* `img` لا `next/image`: المكوّن مشترك بين تطبيقين، و`next/image` يفرض
                  إعداداً لكل واحد. الشعار SVG صغير، فلا مكسب من التحسين. */}
              <img src={m.src} alt={m.alt} style={{ height: 13, width: "auto" }} />
            </span>
          ))}
        </div>
      ) : null}

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
