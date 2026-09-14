import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaySection } from "@modonty/shared/components/commercial/pay-section";
import { TERM_PARAM, resolveTermFromParams } from "@modonty/shared/lib/commercial/resolve-term-from-params";
import { isPayMarkName, payMarkAsset } from "@modonty/shared/lib/commercial/pay-mark-names";

import { getCachedMarketCatalog, getCachedPaySectionContent } from "../../data/get-cached-catalog";
import { PayHeader } from "../../components/pay-header/PayHeader";

/**
 * صفحة البيع (PAY-C2) — تحلّ محلّ شاشة اختبار التوجيه التي كانت هنا.
 *
 * كل ما تراه مرسومٌ بـ`PaySection` المشترك، وهو نفسه الذي ترسم به شاشة المعاينة في
 * الأدمن. فما يعتمده خالد في `/pay-preview` هو هذا حرفاً بحرف — لا نسخة تشبهه.
 *
 * ولا نصّ بيع في هذا الملفّ: الأسماء والأسعار والمزايا والعنوان والإعلان وأسطر الثقة
 * والسطر الضريبي وسطر الضمان والشعارات — كلّها من القاعدة (PAY-DYNAMIC · PAY-G20).
 *
 * ⚠ الزرّ معطَّل عمداً في هذه المرحلة: نموذج الطلب `PAY-C3` والدفع `PAY-D1…D7` لم يُبنيا
 * بعد. زرٌّ يبدو قابلاً للضغط ولا يفعل شيئاً يكسر ثقة المشتري من أوّل لمسة.
 */

/**
 * المدّة المختارة مُدخَلُ وقت-طلبٍ مثل السوق نفسه (`?months=`)، فالصفحة لا تُنتج قوقعةً
 * ساكنةً عند كل مدخل — و`instant: false` يُعفيها من فحص التنقّل الفوري بدل أن يشتكي منه
 * في كل تنمية. الاسم `instant` بلا بادئة `unstable_` لأن 16.3.4 ثبّته
 * (`next/dist/build/segment-config/app/app-segment-config.d.ts:1`؛ توثيق 16.2.9 ما زال
 * يسمّيه `unstable_instant`).
 *
 * البديل — قوقعةٌ ساكنة و`Suspense` حول البطاقات — يعني هيكلاً عظمياً في كل زيارة، لأن
 * السعر والخانة المختارة كلاهما يتبع المدّة. صفحة بيعٍ تُظهر سعرها فوراً أفضل من قوقعةٍ
 * تُظهره بعد لحظة.
 */
export const instant = false;

const MARKETS = { sa: "SA", eg: "EG" } as const;
type MarketSlug = keyof typeof MARKETS;

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }): Promise<Metadata> {
  const { market } = await params;
  if (!(market in MARKETS)) return { title: "الباقات", robots: { index: false, follow: false } };
  const content = await getCachedPaySectionContent(MARKETS[market as MarketSlug]);
  return {
    title: content.headline ?? "الباقات والأسعار",
    description: content.subheadline ?? undefined,
    // لا تُفهرس قبل أن تبيع (PAY-F5 يفتح الفهرسة بعد أوّل عملية حقيقية).
    robots: { index: false, follow: false },
  };
}

export default async function MarketPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ months?: string; duration?: string; plan?: string }>;
}) {
  const { market: slug } = await params;
  if (!(slug in MARKETS)) notFound();
  const market = MARKETS[slug as MarketSlug];

  const [catalog, content, search] = await Promise.all([
    getCachedMarketCatalog(market),
    getCachedPaySectionContent(market),
    searchParams,
  ]);
  const selectedTerm = resolveTermFromParams(catalog.terms, search);

  return (
    <>
      {/* بلا تذييل هنا (خالد ١٤ سبتمبر ٢٠٢٦: «أي تشتيت في صفحة الباقات ما له داعي»).
          كل رابطٍ في صفحة قرارٍ هو مخرجٌ قبل الشراء — والروابط كلّها في الأوفرفيو،
          وهي الصفحة التي جاء منها الزائر أصلاً فلا يفقدها. */}
      <PayHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10" dir="rtl">
      <PaySection
        catalog={catalog}
        content={content}
        selectedTerm={selectedTerm}
        termHref={(paidMonths) => `/${slug}/plans?${TERM_PARAM}=${paidMonths}`}
        priceNote={content.vatNote}
        ctaLabel="اشترك الآن"
        // الزرّ صار حيّاً: يفتح صفحة الدفع بالباقة والمدّة المختارتين (PAY-C3 · PAY-D1).
        ctaHref={(planSlug, paidMonths) => `/${slug}/checkout?plan=${planSlug}&months=${paidMonths}`}
        installmentHref={(planSlug, paidMonths) => `/${slug}/checkout/tamara?plan=${planSlug}&months=${paidMonths}`}
        installmentLabel={content.installmentLabel}
        refundNote={content.refundNote}
        payMarks={content.payMarks.filter(isPayMarkName).map(payMarkAsset)}
        installmentMark={
          content.installmentMark && isPayMarkName(content.installmentMark)
            ? payMarkAsset(content.installmentMark)
            : null
        }
        paymentFootnote={
          content.paymentFootnote || content.paymentFootnoteSub ? (
            <div className="mt-2 text-center text-[11.5px] leading-[1.7] text-muted-foreground">
              {content.paymentFootnote ? <div>{content.paymentFootnote}</div> : null}
              {content.paymentFootnoteSub ? (
                <div dir="ltr" className="mt-0.5 text-[10.5px] opacity-80">{content.paymentFootnoteSub}</div>
              ) : null}
            </div>
          ) : null
        }
        /* الباقة التي ضغطها الزائر في جدول المقارنة — تُحاط بحلقة، والقفزة `#plan-<slug>`
           تنزله عليها. بلا هذا يهبط على ثلاث بطاقات متشابهة ويبحث عن التي اختارها. */
        highlightPlanSlug={search.plan?.trim() || null}
        emptyState={
          /* الحالة الفارغة بلغة الزائر لا بلغة الفريق: لا يُقال له «انشر باقة». */
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="font-semibold">الباقات قيد التحديث</p>
            <p className="mt-1 text-sm text-muted-foreground">تواصل معنا وسنرسل لك التفاصيل مباشرةً.</p>
          </div>
        }
        />
      </main>
    </>
  );
}
