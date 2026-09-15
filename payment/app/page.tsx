import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { FeatureMatrixTable } from "@modonty/shared/components/commercial/feature-matrix-table";
import { formatCatalogMoney } from "@modonty/shared/lib/commercial/format-money";

import { getCachedFeatureMatrix } from "./data/get-cached-feature-matrix";
import { getCachedMarketCatalog, getCachedPaySectionContent } from "./data/get-cached-catalog";
import { PayHeader } from "./components/pay-header/PayHeader";
import { PayFooter } from "./components/pay-footer/PayFooter";
import { MarketPayMethods } from "./components/market-pay-methods/MarketPayMethods";

/**
 * الصفحة الرئيسية للبيمنت — «أوفرفيو» (خالد ١٤ سبتمبر ٢٠٢٦، على نمط `chatgpt.com/overview`).
 *
 * ── القسمة ──
 * هنا: كل المزايا والمقارنة والروابط. وفي `/[market]/plans`: الأسعار والشراء.
 * السبب مقيسٌ عندهم: صفحة أسعارهم لا تحمل سرداً، وصفحة الأوفرفيو لا تحمل سعراً ولا اسم
 * باقة — قسمٌ واحد اسمه «Plans and pricing» فيه سطران وزرّ «Learn more». فمن يصل إلى
 * الأسعار يكون قد قرّر، ولا شيء في الطريق يشتّته.
 *
 * ── ليش بلا سوق ولا سعر ──
 * خالد: «الصفحة هذه عامة للكل لأن احنا ما بنحط أسعار هناك، وتكون فولي سيرفر سايد عشان
 * البرفورمنس». والمزايا واحدة في السعودية ومصر (الفرق في `CommercialPlanPrice` وحده)،
 * فالصفحة صحيحةٌ للسوقين بلا أن تعرف بلد الزائر. وهذا ما يجعلها **ساكنة**: لا
 * `searchParams` ولا `headers` ولا `cookies` — فلا شيء يمنع تسليمها من الحافة.
 * وأوّل صفحةٍ تُفتح في المسار هي أغلى صفحةٍ على الأداء، فسكونها ليس ترفاً.
 *
 * ── ولا حرف بيعٍ مكتوب هنا ──
 * العنوان وسطر الطمأنينة وأسطر الثقة من `PaySectionContent`، والمزايا والمقادير من
 * `getFeatureMatrix`. تعديلها من الأدمن يظهر هنا بإبطال وسم `commercial-catalog`.
 */

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCachedPaySectionContent("SA");
  return {
    title: content.headline ?? "باقات مدونتي",
    description: content.subheadline ?? undefined,
    // لا تُفهرس قبل أن تبيع (PAY-F5 يفتح الفهرسة بعد أوّل عملية حقيقية).
    robots: { index: false, follow: false },
  };
}

export default async function OverviewPage() {
  /**
   * محتوى السعودية يُقرأ بوصفه **نصّاً محايداً** لا سعراً: العنوان وأسطر الثقة واحدة
   * للسوقين، والسعر وحده يختلف — وهو ليس في هذه الصفحة. فالقراءة ثابتة لا تتبع الزائر،
   * وتبقى الصفحة ساكنة.
   */
  const [matrix, content, catalog] = await Promise.all([
    getCachedFeatureMatrix(),
    getCachedPaySectionContent("SA"),
    getCachedMarketCatalog("SA"),
  ]);

  /**
   * أدنى سعرٍ منشور — «تبدأ من…» تحت الزرّ (خالد ١٥ سبتمبر ٢٠٢٦).
   *
   * الصفحة بلا أسعار عمداً، لكنّ الزائر القادم من إعلان يبحث عن رقمٍ فلا يجده، فيدفع
   * نقرةً إضافية أو يغادر. ورقمٌ واحد يكسر الحيرة بلا أن يكسر القاعدة: هو أدنى سعرٍ في
   * السوق الافتراضي، ثابتٌ لا يتبع الزائر — فتبقى الصفحة ساكنة.
   *
   * ويُقرأ من الكتالوج لا يُكتب: تعديل السعر في الأدمن يغيّره هنا كما يغيّره في البطاقة،
   * فلا يبقى «يبدأ من ٣٩٩» بعد أن صار ٤٤٩.
   */
  const cheapest = catalog.plans.reduce<number | null>(
    (min, p) => (min === null || p.monthlyBase < min ? p.monthlyBase : min),
    null,
  );
  const fromPrice =
    cheapest !== null && catalog.plans[0]
      ? formatCatalogMoney(cheapest, catalog.plans[0].currency)
      : null;

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

          {/* الزرّ إلى `/plans` بلا سوق: البروكسي يختار `sa` أو `eg` من بلد الزائر عند
              هذه القفزة بالذات — فالسوق يبدأ مع السعر لا قبله. */}
          <div className="mt-8 flex flex-col items-center gap-3">
            {/* الزرّ لا يُرسم بلا باقة منشورة: كان يقود إلى صفحةٍ فارغة، ووعدٌ لا يُوفى
                أسوأ من زرٍّ غائب. و`fromPrice` يُشتقّ من الكتالوج نفسه فهو دليل وجوده. */}
            {fromPrice ? (
            <a
              href="/plans"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-foreground px-8 text-[15px] font-black text-background shadow-[0_14px_30px_-14px_color-mix(in_oklch,var(--foreground)_45%,transparent)] transition-all hover:bg-foreground/90 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>شوف الباقات والأسعار</span>
              <ArrowLeft className="size-[18px]" strokeWidth={2.5} aria-hidden />
            </a>
            ) : null}
            {fromPrice ? (
              <p className="text-[13px] font-medium text-muted-foreground">
                {/* «في السعودية» ليست حشواً (قياس ١٥ سبتمبر ٢٠٢٦): الرقم مبنيّ من كتالوج
                    `SA` ثابتاً لأن الصفحة بلا سوق — والزائر الإماراتي يقرؤه فيظنّه بالدرهم.
                    والعملة «ر.س.» مكتوبة لكنّها تصف الوحدة لا السوق. وسعر مصر مختلف كليّاً
                    (١١٩٩ ج.م)، فبلا التصريح يصير الرقم وعداً لا يجده من يهبط على `/eg/plans`. */}
                تبدأ من <span className="font-bold text-foreground">{fromPrice}</span> شهرياً في السعودية
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
          /* رابط الباقة يمرّ بالبروكسي هو الآخر، فيهبط على سوق الزائر بالباقة مختارة. */
          /* المرساة تنجو من تحويل البروكسي ٣٠٧: الجزء بعد `#` لا يُرسَل للخادم أصلاً،
             فالمتصفّح يعيد تطبيقه على الوجهة. فتفتح الصفحة على الباقة نفسها. */
          planHref={(slug) => `/plans?plan=${slug}#plan-${slug}`}
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
      </main>

      <PayFooter />
    </>
  );
}
