import { ArrowLeft, ShieldCheck } from "lucide-react";

import { FeatureMatrixTable } from "@modonty/shared/components/commercial/feature-matrix-table";
import { formatCatalogMoney } from "@modonty/shared/lib/commercial/format-money";

import { getCachedFeatureMatrix } from "@/app/data/get-cached-feature-matrix";
import { getCachedMarketCatalog, getCachedPaySectionContent } from "@/app/data/get-cached-catalog";
import { PayHeader } from "@/app/components/pay-header/PayHeader";
import { PayFooter } from "@/app/components/pay-footer/PayFooter";
import { MarketPayMethods } from "@/app/components/market-pay-methods/MarketPayMethods";
import { WhatsappFab } from "@/app/components/whatsapp-fab/WhatsappFab";
import { PublicTeam } from "@/app/components/public-team/PublicTeam";

/**
 * الأوفرفيو — الصفحة الأولى في المسار، بنسخةٍ لكل سوق.
 *
 * ── لماذا صارت تعرف السوق (خالد ١٥ سبتمبر ٢٠٢٦) ──
 * «الصفحه الرئيسيه بتوديه دائما على السعوديه، فالمفروض الاي بي تبع الدوله يبتدي
 * الكنترول من الصفحه الرئيسيه مش من صفحه الباقات بس».
 *
 * وقبلها كانت بلا سوق: سطر «تبدأ من…» مبنيٌّ من كتالوج `SA` ثابتاً، فيقرأ المصريّ
 * **٣٩٩ ر.س.** في أوّل سطرٍ يراه بينما باقته بالجنيه — فإمّا يظنّها أغلى مما هي
 * فيغادر، أو يصل إلى `/eg/plans` فيجد رقماً غير الذي وُعد به. وفي حملةٍ مدفوعة
 * يُدفع ثمن النقرة مرّتين: مرّةً للإعلان ومرّةً للانطباع الخاطئ.
 *
 * ── ولم تفقد سكونها ──
 * السوق لا يُقرأ من رأس الطلب هنا، بل من مقطع المسار (`/` للسعودية · `/eg` لمصر).
 * فالنسختان تُبنيان وقت البناء وتُسلَّمان من الحافة، والبروكسي **يعيد الكتابة**
 * (rewrite) لا يحوّل — فيبقى عنوان المصريّ `/` ويستلم نسخة مصر جاهزة. صفر قفزة
 * وصفر تصيير عند الطلب.
 *
 * ── ولا حرف بيعٍ مكتوب هنا ──
 * العنوان وسطر الطمأنينة وأسطر الثقة من `PaySectionContent`، والمزايا والمقادير من
 * `getFeatureMatrix`. تعديلها من الأدمن يظهر هنا بإبطال وسم `commercial-catalog`.
 */

/** السوقان المنشوران. المفتاح هو مقطع المسار، والقيمة هي رمز السوق في القاعدة. */
export const OVERVIEW_MARKETS = { sa: "SA", eg: "EG" } as const;
export type OverviewSlug = keyof typeof OVERVIEW_MARKETS;
export const isOverviewSlug = (v: string): v is OverviewSlug => v in OVERVIEW_MARKETS;

/** اسم البلد في سطر «تبدأ من…» — يقطع الالتباس الذي وُلد منه هذا المكوّن. */
const MARKET_LABEL: Record<OverviewSlug, string> = { sa: "في السعودية", eg: "في مصر" };

export async function Overview({ slug }: { slug: OverviewSlug }) {
  const market = OVERVIEW_MARKETS[slug];

  const [matrix, content, catalog] = await Promise.all([
    getCachedFeatureMatrix(),
    getCachedPaySectionContent(market),
    getCachedMarketCatalog(market),
  ]);

  /**
   * أدنى سعرٍ منشور — «تبدأ من…» تحت الزرّ.
   *
   * الزائر القادم من إعلان يبحث عن رقمٍ فلا يجده، فيدفع نقرةً إضافية أو يغادر. ورقمٌ
   * واحد يكسر الحيرة. ويُقرأ من كتالوج **سوقه هو** لا يُكتب: تعديل السعر في الأدمن
   * يغيّره هنا كما يغيّره في البطاقة، فلا يبقى «يبدأ من ٣٩٩» بعد أن صار ٤٤٩.
   */
  const cheapest = catalog.plans.reduce<number | null>(
    (min, p) => (min === null || p.monthlyBase < min ? p.monthlyBase : min),
    null,
  );
  const fromPrice =
    cheapest !== null && catalog.plans[0]
      ? formatCatalogMoney(cheapest, catalog.plans[0].currency)
      : null;

  /** كل رابطٍ يغادر هذه الصفحة يحمل سوقها، فلا يُعاد حساب البلد ولا تُفقد نسخة الزائر. */
  const plansHref = `/${slug}/plans`;

  return (
    <>
      <PayHeader />

      <main dir="rtl">
        <section className="mx-auto w-full max-w-4xl px-4 pb-10 pt-14 text-center sm:pt-20">
          {content.announcement ? (
            <p className="mb-5 inline-flex items-center rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1.5 text-[12px] font-semibold text-foreground">
              {content.announcement}
            </p>
          ) : null}

          <h1 className="text-balance text-[30px] font-black leading-[1.25] text-foreground sm:text-[44px]">
            {content.headline ?? "باقات مدونتي"}
          </h1>

          {content.subheadline ? (
            <p className="mx-auto mt-4 max-w-2xl text-balance text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]">
              {content.subheadline}
            </p>
          ) : null}

          {/* شارة الهوية تحت العنوان وقبل الزرّ (خالد ١٥ سبتمبر ٢٠٢٦: «يا تخليها كاتشي
              يا تطلعها فوق»).

              كانت في صفّ الشارات أسفل الصفحة بنفس رماد «فاتورة ضريبية معتمدة» — فتُقرأ
              بنداً إدارياً لا دعوى. وترتيب القراءة في صفحة بيع «ماذا تفعلون ← من أنتم ←
              افعل»، فالهوية تسبق الطلب لا تتبع الحواشي.

              ولا توضع فوق العنوان: هناك شارة العرض المؤقّت، وشارتان متجاورتان تتنازعان —
              تلك ضغط وقت وهذه هوية، ولكلٍّ وظيفة. والعلم معها يُعرَف قبل أن يُقرأ، فتصير
              الشارة الوحيدة الملوّنة في البطل. */}
          <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-success/30 bg-success/10 py-1.5 pe-2 ps-4 text-[13.5px] font-bold text-foreground">
            <img src="/logos/flag-sa.svg" alt="" aria-hidden className="h-6 w-auto shrink-0 rounded-[3px] ring-1 ring-foreground/20" />
            {/* `dir=ltr` على «١٠٠٪» وحدها: `٪` محايد الاتجاه، فداخل نصّ عربيّ يقفز قبل
                الرقم ويُطبع «٪١٠٠». وعزله يُبقيه بعده كما يُقرأ. */}
            منصّة سعودية <span dir="ltr">١٠٠٪</span>
          </p>

          {/* الزرّ إلى باقات **هذا** السوق مباشرةً: الصفحة تعرف سوقها الآن، فقفزةٌ
              وسيطة إلى `/plans` ليعيد البروكسي حساب البلد هي عملٌ مكرّر وقفزةٌ زائدة. */}
          <div className="mt-8 flex flex-col items-center gap-3">
            {/* الزرّ لا يُرسم بلا باقة منشورة: كان يقود إلى صفحةٍ فارغة، ووعدٌ لا يُوفى
                أسوأ من زرٍّ غائب. و`fromPrice` يُشتقّ من الكتالوج نفسه فهو دليل وجوده. */}
            {fromPrice ? (
            <a
              href={plansHref}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-foreground px-8 text-[15px] font-black text-background shadow-[0_14px_30px_-14px_color-mix(in_oklch,var(--foreground)_45%,transparent)] transition-all hover:bg-foreground/90 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>شوف الباقات والأسعار</span>
              <ArrowLeft className="size-[18px]" strokeWidth={2.5} aria-hidden />
            </a>
            ) : null}
            {fromPrice ? (
              <p className="text-[13px] font-medium text-muted-foreground">
                {/* اسم البلد يبقى مكتوباً رغم أن الرقم صار بسوق الزائر: الإماراتيّ
                    والكويتيّ يُخدَمان بكتالوج السعودية، فبلا التصريح يقرأ الإماراتيّ
                    الرقم بالدرهم. والعملة مكتوبة لكنّها تصف الوحدة لا السوق. */}
                تبدأ من <span className="font-bold text-foreground">{fromPrice}</span> شهرياً {MARKET_LABEL[slug]}
              </p>
            ) : null}
            {content.refundNote ? (
              <p className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <ShieldCheck className="size-[15px] shrink-0 text-success" strokeWidth={2.25} aria-hidden />
                {content.refundNote}
              </p>
            ) : null}
          </div>

          {/* طرق الدفع تحت الزرّ لا فوقه: فوقه تؤخّر وصوله إلى الأسعار، وتحته تطمئن
              من قرأ الوعد ولم يضغط بعد. */}
          {/* عنوانٌ للقارئ الآلي وحده: القسم كان كتلةً بلا اسم، فيمرّ عليه قارئ الشاشة
              أيقوناتٍ متتابعة بلا سياق. و`sr-only` يبقيه خارج البصر. */}
          <h2 className="sr-only">طرق الدفع المقبولة</h2>
          <MarketPayMethods />

          {content.trustItems.length > 0 ? (
            <>
            <h2 className="sr-only">ما يضمنه اشتراكك</h2>
            <ul className="mx-auto mt-9 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-2">
              {content.trustItems.map((t) => (
                <li
                  key={t}
                  className="rounded-lg border border-border/60 bg-card/40 px-3 py-1.5 text-[12px] text-muted-foreground"
                >
                  {t}
                </li>
              ))}
            </ul>
            </>
          ) : null}
        </section>

        <FeatureMatrixTable
          matrix={matrix}
          /* رابط الباقة يحمل سوق الصفحة، فيفتح البطاقة نفسها في السوق نفسه بلا تحويل. */
          planHref={(planSlug) => `${plansHref}?plan=${planSlug}#plan-${planSlug}`}
          ctaLabel="شوف سعرها"
          className="pb-16"
          /* بلغة الزائر لا بلغة الفريق: لا يُقال له «انشر باقة». */
          emptyState={
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border px-6 py-12 text-center">
              <p className="text-[15px] font-bold text-foreground">الباقات قيد التحديث</p>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                تواصل معنا وسنرسل لك التفاصيل والأسعار مباشرةً.
              </p>
            </div>
          }
        />

        {/* بعد الجدول لا قبله: الزائر يقرأ ما يشتريه أوّلاً، ثم من سيتابع معه — والثقة
            في الناس تُختم بها الصفحة لا تُفتتح. */}
        <PublicTeam market={market} />
      </main>

      <PayFooter />

      {/* في صفحات التصفّح وحدها: السؤال يولد هنا، ومسار الشراء له زرّه الأدقّ. */}
      <WhatsappFab text="مرحباً، عندي سؤال عن باقات مدونتي" />
    </>
  );
}
