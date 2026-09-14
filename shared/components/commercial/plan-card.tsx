
import { COMMERCIAL_PLAN_THEMES } from "../../lib/commercial/plan-themes";
import type { CatalogPlan, CatalogTerm } from "../../lib/commercial/get-market-catalog";
import { buildTermPricing } from "../../lib/commercial/term-pricing";
import { formatMonths } from "../../lib/commercial/arabic-months";
import { cx } from "../../lib/cx";
import { currencyLabel, formatAmountMinor as amount } from "../../lib/commercial/format-money";

/**
 * بطاقة البيع — بنيتها منقولة من بطاقة جبر سيو (`PricingSection.tsx`) بطلب خالد
 * (١٣ سبتمبر ٢٠٢٦: «اعمل لي UI مطابق»)، وألوانها من علامة مدونتي لا من علامته.
 *
 * الترتيب الذي تتبعه — وهو ترتيب Stripe وNotion وSlack نفسه: الاسم · السعر · الزرّ ·
 * ما تحصل عليه. الزائر جاء للرقم، فتأخيرُه خلف ادّعاء يجعل الصفحة تُقرأ كإعلان.
 *
 * مكوّن سيرفر: نصّ وأيقونة، بلا جافاسكربت على الزائر. تستهلكه شاشة المعاينة و`/pay`
 * (PAY-C2) معاً، فما يُعتمد في الأولى هو ما يراه المشتري في الثانية.
 */

const ar = new Intl.NumberFormat("ar-SA");

export interface PlanCardProps {
  plan: CatalogPlan;
  term: CatalogTerm | null;
  /** السطر الضريبي — ادّعاءٌ عن قانون سوق يقرّره المستدعي (PAY-UNKNOWN #5). */
  priceNote: string | null;
  /** النصّ الافتراضي حين لا تحمل الباقة نصّ زرّ خاصاً بها (PAY-G11). */
  ctaLabel: string;
  ctaDisabled?: boolean;
  /**
   * وجهة زرّ الشراء ووجهة زرّ التقسيط. حين تُمرَّران يصير العنصر رابطاً حقيقياً — يُفتح في
   * تبويب جديد بالزرّ الأوسط، ويُنسخ عنوانه، ويراه الزاحف. و`<button>` بلا وجهة كان يمنع
   * ذلك كلّه. وحين لا تُمرَّران (شاشة المعاينة) يبقى زرّاً معطَّلاً يُرى ولا يبيع.
   */
  ctaHref?: string | null;
  installmentHref?: string | null;
  /** «قسّطها على دفعات» — يظهر فقط حين يقرّر المستدعي أن التقسيط متاح لهذا السوق (PAY-D6). */
  installmentLabel?: string | null;
  /** «استرداد ١٤ يوم…» — وعدٌ يخصّ الاشتراك لا طريقة الدفع، فيلي الزرّين معاً. */
  refundNote?: string | null;
  /** علامات الدفع أسفل البطاقة. فارغة = لا ذيل، فلا يُرسم إطارٌ بلا محتوى. */
  payMarks?: { src: string; alt: string }[];
  /** شعار التقسيط، حين يكون متاحاً. */
  installmentMark?: { src: string; alt: string } | null;
}

export function PlanCard({
  plan,
  term,
  priceNote,
  ctaLabel,
  ctaDisabled = false,
  ctaHref = null,
  installmentHref = null,
  installmentLabel = null,
  refundNote = null,
  payMarks = [],
  installmentMark = null,
}: PlanCardProps) {
  const theme = COMMERCIAL_PLAN_THEMES[plan.theme];
  const featured = Boolean(plan.featuredBadge);
  const currency = currencyLabel(plan.currency);
  const pricing = term
    ? buildTermPricing({ monthlyBase: plan.monthlyBase, paidMonths: term.paidMonths, bonusServiceMonths: term.bonusServiceMonths })
    : null;

  /**
   * الميزة ذات الكمّية تصعد إلى كتلة الأرقام أعلى القائمة، وما لا كمّية له يبقى سطراً.
   * تقسيمٌ من البيانات لا من قائمة مكتوبة: ميزة جديدة تجد مكانها وحدها حسب شكلها.
   */
  /**
   * كتلة الأرقام تحمل ما **يتراكم** وحده: ميزة وحدتها «/شهر» ولها كمّية، فيصحّ ضربها في
   * أشهر الخدمة («٨ مقال/شهر» ← «٥٦ مقالاً»). وما عداها يبقى سطراً في القائمة بكمّيته كما
   * هي — «٢٢ تنبيه» عددٌ ثابت لا يتضاعف بطول المدّة، وضربُه يخترع وعداً لم يُقطَع.
   * (خالد ١٣ سبتمبر ٢٠٢٦: الحملات ظهرت ٢٨ والتنبيهات ٢٢ مرّتين — قاعدتي كانت أوسع من اللازم.)
   */
  const accrues = (f: (typeof plan.features)[number]) => f.quantity !== null && Boolean(f.unitLabel?.includes("/شهر"));
  const metrics = plan.features.filter(accrues);
  const bullets = plan.features.filter((f) => !accrues(f));
  const serviceMonths = pricing?.serviceMonths ?? null;

  return (
    <article
      className={cx(
        "relative flex flex-col rounded-[18px] border-2 px-6 py-7",
        theme.background,
        featured ? "border-primary ring-2 ring-primary/40" : "border-border",
      )}
    >
      {/* الاسم على لسانٍ يركب الحافّة العليا: هو ما يُقارَن ويُشار إليه، فيأخذ الموضع الأوّل
          والحجم الذي يُقرأ من بعيد. والشارة المميِّزة تلوّن اللسان بدل أن تزاحمه سطراً. */}
      <span
        className={cx(
          "absolute -top-[19px] start-6 z-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[20px] font-extrabold leading-none",
          featured ? "bg-primary text-primary-foreground" : "border-2 border-border bg-card text-foreground",
        )}
      >
        {featured ? <span aria-hidden>★</span> : null}
        {plan.name}
      </span>

      {/* السعر على شريط يخرج من حشوة البطاقة إلى حافّتيها: رقمٌ في وسط شريط كامل العرض
          يُقرأ كبطاقة سعر، لا كجملة بين جمل. بلا استدارة ولا تعبئة قويّة — فالأزرار وحدها
          هي المستديرة المعبَّأة هنا، وأي شيء يلبس لبسها يُقرأ كأنه يُضغط. */}
      <div className="-mx-6 mt-3 mb-1 border-y bg-foreground/[.03] px-6 py-4 text-center">
        {pricing ? (
          <>
            <div className="flex items-baseline justify-center gap-2">
              {/* dir=ltr على الرقم: السعر لا ينعكس في أي لغة، وفاصل الآلاف يبقى مكانه. */}
              {/* tracking سالب للنصّ الكبير (Apple §15): الحروف تُقرأ متباعدة كلّما كبرت. */}
              <span dir="ltr" className="text-[40px] font-semibold leading-none tracking-[-0.02em]">{amount(pricing.totalMinor, plan.currency)}</span>
              <span className="text-[13px] text-muted-foreground">
                {currency} · {formatMonths(pricing.serviceMonths)}
              </span>
            </div>
            {/* السعر الفعليّ والهدية في سطر واحد — هنا وحده يشرح الرقمان أحدهما الآخر:
                الشهر أرخص لأن شهراً مجانيّ. ويُطبع في كل المدد لا في ذات الهدية فقط،
                وإلّا اختفى عند «٣ أشهر» وهي المدّة التي يختارها المتردّد. */}
            {/* ليس text-primary: أزرق العلامة على سطح داكن = ٢٫٣٧:١ (WCAG 1.4.3 يفرض ٤٫٥:١).
                ولونُ النصّ الأساسيّ يمرّ في الوضعين، والوزن ٧٠٠ يحمل التمييز بدل اللون. */}
            <p className="mt-2 text-[12px] font-bold leading-[1.6]">
              = <span dir="ltr">{amount(pricing.effectiveMonthlyMinor, plan.currency)}</span> {currency}/شهر فعلياً
              {pricing.bonusServiceMonths > 0 ? (
                <span className="font-semibold text-muted-foreground">
                  {" · "}منها {formatMonths(pricing.bonusServiceMonths)} مجاناً
                </span>
              ) : null}
            </p>
          </>
        ) : (
          <div className="flex items-baseline justify-center gap-2">
            <span dir="ltr" className="text-[40px] font-semibold leading-none tracking-[-0.02em]">{ar.format(plan.monthlyBase)}</span>
            <span className="text-[13px] text-muted-foreground">{currency} / شهر</span>
          </div>
        )}
        {priceNote ? <p className="mt-1 text-[11px] text-muted-foreground">{priceNote}</p> : null}
      </div>

      {plan.hook ? <p className="mt-3 text-center text-[13px] font-bold">{plan.hook}</p> : null}

      {/* الزرّ تحت السعر مباشرةً — نفس ترتيب Stripe وNotion: الاسم · السعر · الزرّ · القائمة. */}
      {(() => {
      const ctaClass = cx(
          // الاستجابة على الضغط لا على الإفلات (Apple §1): الانكماش يبدأ لحظة pointer-down،
          // ومدّته ١٠٠ms كي لا تُحسّ كتأخير. وتُلغى لمن طلب تقليل الحركة.
          "mt-4 h-12 w-full rounded-xl text-[15px] font-bold",
          // حلقة تركيز صريحة: المتصفّح يعطي الأزرار `outline-style: none` هنا، فلا يرى
          // مستعملُ لوحة المفاتيح أين هو (WCAG 2.4.7). حلقتان بلونين — لون النصّ والخلفية —
          // تُرى على أي سطح، فاتحاً كان أو داكناً.
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "transition-transform duration-100 ease-out active:scale-[0.98]",
          "motion-reduce:transition-none motion-reduce:active:scale-100",
          /**
           * الزرّ المصمت واحدٌ على الصفحة: بطاقة «الأكثر اختياراً». وما عداها زرٌّ محدَّد.
           *
           * كان يتبع ثيم الباقة، فأنتج عطلين مقيسين (١٤ سبتمبر ٢٠٢٦ على /sa):
           *   ١ هرميّة مقلوبة: البطاقة المميَّزة ★ زرّها رماديّ، وباقةٌ غير مميَّزة
           *     تحمل الزرّ الأزرق — فالعين تُقاد إلى غير ما نوصي به.
           *   ٢ فخّ تباين: ثيم PREMIUM تعبئته chart-4 ونصُّه فاتح = ٣٫٣٩:١ في الوضع
           *     الفاتح (WCAG 1.4.3 تفرض ٤٫٥:١ لنصّ ١٥px)، وبديلُه الكحليّ = ١٫٠٣:١
           *     في الداكن. أي أن اللون الذي يصحّ في وضعٍ يسقط في الآخر.
           * وثيم الباقة يبقى يميّزها — بخلفيّتها وحدّها وشارتها — لكن ما «يُضغط» واحد.
           */
          featured
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border-2 border-foreground/25 bg-secondary text-secondary-foreground hover:bg-secondary/80",
          ctaDisabled && "cursor-not-allowed opacity-50",
        );
      const label = plan.ctaText || ctaLabel;
      return ctaHref && !ctaDisabled ? (
        <a href={ctaHref} className={cx(ctaClass, "flex items-center justify-center no-underline")}>{label}</a>
      ) : (
        <button type="button" disabled={ctaDisabled} className={ctaClass}>{label}</button>
      );
      })()}

      {/* التقسيط يجيب على السعر المعروض، والسعر على هذه البطاقة — فموضعه هنا لا في صفحة
          الدفع. ولا يظهر إلا حين يقرّر المستدعي أن السوق يقبله (تمارا ترفض مصر). */}
      {installmentLabel ? (() => {
        const insClass = cx(
            // الحدّ وحده كان يترك النصّ بلون الوارث — ١٫٠١:١ في الداكن. `text-foreground`
            // يجعله يتبع السطح في الوضعين، و`active:scale` يعطي استجابة اللمس (Apple §1).
            "mt-2 h-11 w-full rounded-xl border text-[14px] font-bold text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "transition-transform duration-100 ease-out hover:bg-muted active:scale-[0.98]",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
            ctaDisabled && "cursor-not-allowed opacity-50",
          );
        return installmentHref && !ctaDisabled ? (
          <a href={installmentHref} className={cx(insClass, "flex items-center justify-center no-underline")}>{installmentLabel}</a>
        ) : (
          <button type="button" disabled={ctaDisabled} className={insClass}>{installmentLabel}</button>
        );
      })() : null}

      {/* يلي الزرّين معاً عن قصد: الأربعة عشر يوماً تخصّ الاشتراك لا طريقة الدفع، ووضعه
          تحت أحدهما يجعله وعداً يخصّ ذلك الزرّ وحده. */}
      {refundNote ? (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <span aria-hidden>✓</span>
          <span>{refundNote}</span>
        </p>
      ) : null}

      {/* كتلة الأرقام: المجموع خلال المدّة كبيراً، والإيقاع الشهري تحته — «٥٦ مقالاً» حجمُ
          الصفقة و«٨ / شهر» وتيرتها، والثاني يسمح بمراجعة الأوّل بدل تصديقه. */}
      {metrics.length > 0 ? (
        <div className="mt-5 space-y-3">
          {metrics.map((f) => {
            const perTerm = serviceMonths ? (f.quantity ?? 0) * serviceMonths : null;
            return (
              <div key={f.id} className="flex items-center gap-3">
                {/* نقطةٌ لا أيقونة (خالد ١٤ سبتمبر ٢٠٢٦: «الأيقونة ما نحتاجها»). سجلّ
                    الأيقونات كان يفرض اختياراً لكل ميزة ولا يضيف معنى — والرقم نفسه هو
                    العلامة التي تُقرأ. */}
                <span aria-hidden className={cx("size-1.5 shrink-0 rounded-full", featured ? "bg-primary" : "bg-muted-foreground/40")} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={cx("text-[22px] font-extrabold leading-[1.15]", (featured || f.isHighlighted) && "text-primary")}>
                      {ar.format(perTerm ?? f.quantity ?? 0)}
                      <span className="text-[13px] font-bold text-muted-foreground"> {f.name}</span>
                    </span>
                    <span className="shrink-0 text-[12px] text-muted-foreground">
                      {ar.format(f.quantity ?? 0)} {f.unitLabel ?? ""}
                    </span>
                  </div>
                  {f.note ? <p className="text-[11px] text-muted-foreground">{f.note}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* «كل ما في الزخم +» — الباقة الأعلى لا تكرّر صفوف الأدنى، تشير إليها ثم تُظهر الفارق. */}
      {plan.inheritsFrom ? (
        <p className="mt-5 text-[13px] font-bold">كل ما في {plan.inheritsFrom} +</p>
      ) : (
        bullets.length > 0 ? <p className="mt-5 text-[13px] font-bold text-muted-foreground">اللي بتحصل عليه:</p> : null
      )}

      {bullets.length > 0 ? (
        <ul className="mt-2.5 space-y-2.5 text-[13.5px]">
          {bullets.map((f) => (
            <li key={f.id} className="flex gap-2.5">
              <span aria-hidden className={cx("mt-[7px] size-1.5 shrink-0 rounded-full", featured ? "bg-primary" : "bg-muted-foreground/40")} />
              <span>
                {/* «مميّزة» من المكتبة: سطرٌ يستحقّ أن يُرى قبل غيره يُطبع عريضاً — إبرازٌ
                    بالوزن لا باللون، فيبقى مقروءاً في الوضعين ولمن لا يميّز الألوان. */}
                <span className={f.isHighlighted ? "font-bold" : undefined}>{f.name}</span>
                {f.quantity !== null ? (
                  <span className="text-muted-foreground"> — {ar.format(f.quantity)} {f.unitLabel ?? ""}</span>
                ) : null}
                {f.note ? <span className="block text-[11px] text-muted-foreground">{f.note}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* السطور المميّزة آخر القائمة: وعودٌ بلا رقم، والأرقام أعلاها هي التي تُقارَن. */}
      {plan.highlights.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-[13px] font-semibold">
          {plan.highlights.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-current" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* ذيل العلامات: يخرج من حشوة البطاقة إلى حافّتيها ويلتصق بالأسفل (`mt-auto`)،
          فيُقرأ جزءاً من البطاقة لا صندوقاً بداخلها. والبطاقات في جهة والتقسيط في جهة
          بينهما فراغ — لأنهما ليسا شيئاً واحداً: البطاقات تمرّ ببوّابتنا، والتقسيط شركة
          مستقلّة بعقدها. الفصل يقول ذلك بلا شرح.

          و`flex-wrap` لا عصر: البطاقة ٣٢١px والمجموعتان ٢٦١px — على حافّة الضيق. بلا التفاف
          تنكسر الأوسمة إلى سطرين داخل خانتها (قيست ٢٣px بدل ١٢). الالتفاف ينقل المجموعة
          الثانية إلى سطر كامل بدل أن يكسر كلمةً في نصفها. */}
      {payMarks.length > 0 ? (
        <div className="-mx-6 -mb-7 mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-b-[16px] border-t bg-foreground/[.02] px-6 pb-3 pt-4">
          <span className="flex items-center gap-2">
            <span className="whitespace-nowrap text-[11.5px] leading-none text-muted-foreground">الدفع عبر</span>
            <span className="flex items-center gap-1.5">
              {payMarks.map((m) => (
                <span key={m.src} className="flex h-5 items-center rounded bg-white px-1 ring-1 ring-black/5">
                  {/* `img` لا `next/image`: المكوّن مشترك بين تطبيقين، و`next/image` يفرض
                      إعداداً لكل واحد. الشعار SVG صغير، فلا مكسب من التحسين. */}
                  <img src={m.src} alt={m.alt} style={{ height: 11, width: "auto" }} />
                </span>
              ))}
            </span>
          </span>
          {installmentMark ? (
            <span className="flex items-center gap-2">
              <span className="whitespace-nowrap text-[11.5px] leading-none text-muted-foreground">أو قسّط</span>
              <span className="flex h-5 items-center rounded bg-white px-1 ring-1 ring-black/5">
                <img src={installmentMark.src} alt={installmentMark.alt} style={{ height: 11, width: "auto" }} />
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
