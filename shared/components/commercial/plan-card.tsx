
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
  /**
   * ⚠ لم تعد تُرسم داخل البطاقة (خالد ١٤ سبتمبر ٢٠٢٦): وعدٌ واحد مكرّر ثلاث مرّات
   * في شبكةٍ واحدة يفقد ثقله ويصير ضجيجاً. موضعه الآن سطرٌ واحد تحت الشبكة في
   * `PaySection`. تبقى الخاصيّة في الواجهة كي لا ينكسر مستدعٍ يمرّرها، وتُهمَل.
   */
  refundNote?: string | null;
  /** علامات الدفع أسفل البطاقة. فارغة = لا ذيل، فلا يُرسم إطارٌ بلا محتوى. */
  payMarks?: { src: string; alt: string }[];
  /** شعار التقسيط، حين يكون متاحاً. */
  installmentMark?: { src: string; alt: string } | null;
  /** مرساةٌ للقفز إليها من جدول المقارنة (`#plan-<slug>`). */
  anchorId?: string | null;
  /** الباقة التي جاء منها الزائر — تُحاط بحلقة كي يجدها فوراً. */
  highlighted?: boolean;
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
  anchorId = null,
  highlighted = false,
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
      id={anchorId ?? undefined}
      /* `scroll-mt` لا زينة: الترويسة لاصقة، فالقفزة إلى `#plan-x` تضع البطاقة تحتها
         ويظهر نصفها. والهامش يدفعها إلى ما تحت الترويسة بالضبط. */
      className={cx(
        /* ظلٌّ خفيف في الفاتح وحده: خلفية الصفحة rgb(243,243,241) وجسم البطاقة
           rgb(241,241,255) — نسبتهما ١٫٠١:١، أي لا يفصلهما لون. فالحدّ يحمل الالتزام
           (WCAG 1.4.11) والظلّ يحمل الإحساس بالارتفاع. ويُلغى في الداكن لأن الظلّ الأسود
           على سطحٍ أسود لا يُرى، والفصل هناك يأتي من فاتحيّة البطاقة نفسها. */
        "relative flex flex-col rounded-[18px] border px-5 py-6 scroll-mt-24",
        "shadow-[0_1px_2px_rgba(14,6,90,.05),0_12px_28px_-16px_rgba(14,6,90,.22)] dark:shadow-none",
        theme.background,
        /**
         * حدّ البطاقة غير المميَّزة `foreground/50` لا `border` (قياس ١٤ سبتمبر ٢٠٢٦).
         *
         * توكن `--border` يُخرج rgb(219,219,219) فاتحًا و rgb(48,47,55) داكنًا، وقياسه ضدّ
         * خلفيّة الصفحة **١٫٢٥:١** و**١٫٣٨:١** — وكلاهما يرسب حدّ WCAG 1.4.11 (٣:١ لحدود
         * عناصر الواجهة). وجسم البطاقة نفسه **١٫٠١:١** ضدّ الصفحة، أي أنه لا يفصلها شيء:
         * بطاقتان من ثلاث كانتا بلا حافّة مرئيّة، والمميَّزة وحدها تُرى لأن حدّها أزرق (٦٫٣٢:١).
         *
         * و`foreground/50` يُخرج rgb(133,129,173) فاتحًا (**٣٫٢٩:١**) و rgb(141,141,143)
         * داكنًا (**٥٫٥:١**) — قيمة واحدة تعبر في السمتين لأنها تُشتقّ من `foreground` نفسه
         * الذي ينقلب مع السمة، لا من رمادٍ ثابت يصلح في واحدة ويسقط في الأخرى.
         */
        /**
         * الاختيار يلوّن **الحدّ نفسه** لا يضيف حلقةً خارجه (خالد ١٤ سبتمبر ٢٠٢٦).
         * الحلقة سطحٌ ثانٍ حول البطاقة فتبدو مركَّبةً عليها، والحدّ صفةٌ فيها — والفرق
         * يُقرأ: «هذه بطاقة مختارة» لا «بطاقة داخل إطار».
         *
         * وكهرمانيّ لا `primary`: المميَّزة حدّها أزرق أصلاً، فلونٌ أزرق على أخرى يجعل
         * بطاقتين زرقاوين ولا يُعرف أيّهما المقصود. والدرجتان مختلفتان بين السمتين لأن
         * لوناً واحداً يسقط في إحداهما — قيس على خلفيّتَي المنصّة: `amber-700` ⇒ ٤٫٥٢:١
         * فاتحاً و`amber-400` ⇒ ١٠٫٩١:١ داكناً، وكلاهما فوق حدّ WCAG 1.4.11 (٣:١)،
         * بينما `amber-500` وحده يرسب فاتحاً (١٫٩٣:١).
         *
         * ومعه شارة «اللي اخترتها» النصّية: اللون وحده لا يحمل معنًى (WCAG 1.4.1).
         */
        highlighted
          ? "border-amber-700 dark:border-amber-400"
          : featured
            ? "border-primary ring-1 ring-primary/35"
            : "border-foreground/50",
      )}
    >
      {/* الاسم على لسانٍ يركب الحافّة العليا: هو ما يُقارَن ويُشار إليه، فيأخذ الموضع الأوّل
          والحجم الذي يُقرأ من بعيد. والشارة المميِّزة تلوّن اللسان بدل أن تزاحمه سطراً. */}
      <span
        className={cx(
          "absolute -top-[19px] start-6 z-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[20px] font-extrabold leading-none",
          featured ? "bg-primary text-primary-foreground" : "border border-foreground/30 bg-card text-foreground",
        )}
      >
        {featured ? <span aria-hidden>★</span> : null}
        {plan.name}
      </span>

      {/* المدّة على لسانٍ في الزاوية **المقابلة** للاسم (خالد ١٤ سبتمبر ٢٠٢٦): الاسم
          يركب الحافّة من جهة `start`، والمدّة من جهة `end` — فيتوازن رأس البطاقة ويُقرأ
          الاثنان معاً «الانطلاقة · ٧ أشهر» بلا أن تزاحم المدّةُ الرقمَ في شريط السعر.
          وحياديّة شكلها مقصودة: حدٌّ ونصٌّ ثانويّ لا تعبئة — فاللسان المعبَّأ لباس الاسم
          وحده، ولباسٌ مشترك يجعل العين تحسبهما شيئاً واحداً. */}
      {pricing ? (
        <span className="absolute -top-[13px] end-6 z-10 inline-flex items-center rounded-full border border-foreground/25 bg-card px-3 py-0.5 text-[11px] font-bold text-muted-foreground">
          {formatMonths(pricing.serviceMonths)}
        </span>
      ) : null}

      {/* شارة «اللي اخترتها» في الحافّة المقابلة للاسم: الحلقة الكهرمانية لونٌ، واللون
          وحده لا يحمل معنًى (WCAG 1.4.1) — ولا يراه عمى الألوان ولا قارئ الشاشة. وموضعها
          `end` لا `start` كي لا تزاحم لسان الاسم على بطاقةٍ مميَّزة تحمل الاثنين. */}
      {highlighted ? (
        <span className="absolute top-3 end-6 z-10 inline-flex items-center rounded-full border border-amber-700 bg-card px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:border-amber-400 dark:text-amber-400">
          اللي اخترتها
        </span>
      ) : null}

      {/* السعر على شريط يخرج من حشوة البطاقة إلى حافّتيها: رقمٌ في وسط شريط كامل العرض
          يُقرأ كبطاقة سعر، لا كجملة بين جمل. بلا استدارة ولا تعبئة قويّة — فالأزرار وحدها
          هي المستديرة المعبَّأة هنا، وأي شيء يلبس لبسها يُقرأ كأنه يُضغط. */}
      <div className="-mx-5 mt-3 mb-1 border-y bg-foreground/[.03] px-5 py-4 text-center">
        {pricing ? (
          <>
            <div className="flex items-baseline justify-center gap-2">
              {/* dir=ltr على الرقم: السعر لا ينعكس في أي لغة، وفاصل الآلاف يبقى مكانه. */}
              {/* tracking سالب للنصّ الكبير (Apple §15): الحروف تُقرأ متباعدة كلّما كبرت. */}
              <span dir="ltr" className="text-[40px] font-extrabold leading-none tracking-[-0.02em]">{amount(pricing.totalMinor, plan.currency)}</span>
              {/* العملة وحدها هنا — المدّة صعدت إلى لسانٍ في الزاوية المقابلة للاسم
                  (خالد ١٤ سبتمبر ٢٠٢٦). المدّة واحدةٌ للبطاقات الثلاث، فتكرارها ثلاث
                  مرّات بجوار ثلاثة أسعار مختلفة يُقرأ كأنها جزءٌ من السعر. */}
              {/* «شامل الضريبة» ملتصقة بالرقم لا سطراً ثالثاً (خالد ١٤ سبتمبر ٢٠٢٦).
                  الشمول **وصفٌ للرقم**: يقول إن ٢٬٣٩٤ هو ما يُدفع لا ما تُضاف عليه
                  الضريبة، وهو أوّل ما يسأل عنه المشتري السعودي — ونظاماً يجب أن يكون
                  واضحاً عند السعر لا في حاشية. وسطرٌ كامل مكرّر في ثلاث بطاقات ضجيج،
                  فاختُصر هنا ونزل نصّه الكامل مرّة واحدة تحت الشبكة. */}
              <span className="text-[13px] font-medium text-muted-foreground">
                {currency}
                {priceNote ? <span className="text-[11px]"> شامل الضريبة</span> : null}
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
                <span className="font-bold text-muted-foreground">
                  {" · "}منها {formatMonths(pricing.bonusServiceMonths)} مجاناً
                </span>
              ) : null}
            </p>
          </>
        ) : (
          <div className="flex items-baseline justify-center gap-2">
            <span dir="ltr" className="text-[40px] font-extrabold leading-none tracking-[-0.02em]">{ar.format(plan.monthlyBase)}</span>
            <span className="text-[13px] font-medium text-muted-foreground">{currency} / شهر</span>
          </div>
        )}
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
            : "border border-foreground/30 bg-secondary text-secondary-foreground hover:bg-secondary/80",
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
            "mt-2 h-11 w-full rounded-xl border text-[13px] font-bold text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "transition-transform duration-100 ease-out hover:bg-muted active:scale-[0.98]",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
            ctaDisabled && "cursor-not-allowed opacity-50",
          );
        /**
         * شعار المزوّد **داخل الزرّ** (خالد ١٤ سبتمبر ٢٠٢٦): شعارات البطاقات خرجت إلى
         * سطرٍ واحد تحت الشبكة لأنها واحدة في الباقات الثلاث فليست فرقاً بينها — أمّا
         * هذا فمربوطٌ بالزرّ نفسه ويقول من يموّل التقسيط، فبقاؤه هنا معلومةٌ لا زينة.
         */
        const body = (
          <>
            <span>{installmentLabel}</span>
            {installmentMark ? (
              /* ⚠ **الاستثناء الوحيد من التوكنات في هذا المكوّن، ومقصود.** شعارات مدى وفيزا
                  وماستركارد وتمارا علاماتٌ تجارية بألوان ثابتة مصمَّمة على أرضيّة فاتحة —
                  على سطحٍ داكن تختفي أو تنقلب. فالأرضيّة بيضاء في السمتين، كما تفعل
                  Stripe وShopify، وهو نفس منطق إطار البطاقة في `CardField`.

                  والحدّ وحده يتبع التوكن: `ring-black/5` كان يُخرج rgb(242,242,242)
                  و**١٫٠٠:١** ضدّ البطاقة الفاتحة — أي شريحةٌ بيضاء بلا حافّة على سطحٍ
                  أبيض. و`foreground/50` يُخرج ٣٫١٩:١ فاتحاً (فوق حدّ WCAG 1.4.11) ويخفّ
                  في الداكن حيث البياض نفسه يكفي للفصل (١٨٫٢:١). */
                <span className="flex h-[18px] items-center rounded bg-white px-1 ring-1 ring-foreground/50 dark:ring-foreground/20">
                <img src={installmentMark.src} alt={installmentMark.alt} style={{ height: 10, width: "auto" }} />
              </span>
            ) : null}
          </>
        );
        return installmentHref && !ctaDisabled ? (
          <a href={installmentHref} className={cx(insClass, "flex items-center justify-center gap-2 no-underline")}>{body}</a>
        ) : (
          <button type="button" disabled={ctaDisabled} className={cx(insClass, "flex items-center justify-center gap-2")}>{body}</button>
        );
      })() : null}

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
                    <span className={cx("text-[20px] font-extrabold leading-[1.15]", (featured || f.isHighlighted) && "text-primary")}>
                      {ar.format(perTerm ?? f.quantity ?? 0)}
                      <span className="text-[13px] font-bold text-muted-foreground"> {f.name}</span>
                    </span>
                    <span className="shrink-0 text-[12px] font-medium text-muted-foreground">
                      {ar.format(f.quantity ?? 0)} {f.unitLabel ?? ""}
                    </span>
                  </div>
                  {f.note ? <p className="text-[11px] font-medium text-muted-foreground">{f.note}</p> : null}
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
        <ul className="mt-2.5 space-y-2.5 text-[13px]">
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
                {f.note ? <span className="block text-[11px] font-medium text-muted-foreground">{f.note}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* السطور المميّزة آخر القائمة: وعودٌ بلا رقم، والأرقام أعلاها هي التي تُقارَن. */}
      {plan.highlights.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-[13px] font-bold">
          {plan.highlights.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-current" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : null}

    </article>
  );
}
