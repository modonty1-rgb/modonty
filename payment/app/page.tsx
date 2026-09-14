import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { FeatureMatrixTable } from "@modonty/shared/components/commercial/feature-matrix-table";

import { getCachedFeatureMatrix } from "./data/get-cached-feature-matrix";
import { getCachedPaySectionContent } from "./data/get-cached-catalog";
import { PayHeader } from "./components/pay-header/PayHeader";
import { PayFooter } from "./components/pay-footer/PayFooter";

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
  const [matrix, content] = await Promise.all([
    getCachedFeatureMatrix(),
    getCachedPaySectionContent("SA"),
  ]);

  return (
    <>
      <PayHeader showSocials />

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

          {/* الزرّ إلى `/plans` بلا سوق: البروكسي يختار `sa` أو `eg` من بلد الزائر عند
              هذه القفزة بالذات — فالسوق يبدأ مع السعر لا قبله. */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href="/plans"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-foreground px-8 text-[15px] font-black text-background shadow-[0_14px_30px_-14px_color-mix(in_oklch,var(--foreground)_45%,transparent)] transition-all hover:bg-foreground/90 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>شوف الباقات والأسعار</span>
              <ArrowLeft className="size-[18px]" strokeWidth={2.5} aria-hidden />
            </a>
            {content.refundNote ? (
              <p className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <ShieldCheck className="size-[15px] shrink-0 text-success" strokeWidth={2.25} aria-hidden />
                {content.refundNote}
              </p>
            ) : null}
          </div>

          {content.trustItems.length > 0 ? (
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
        />
      </main>

      <PayFooter />
    </>
  );
}
