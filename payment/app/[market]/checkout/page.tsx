import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { formatCatalogMoneyMinor } from "@modonty/shared/lib/commercial/format-money";
import { buildOrderSnapshot } from "@modonty/shared/lib/payments/build-order-snapshot";
import { vatRateBpForMarket } from "@modonty/shared/lib/payments/vat-rate";
import { resolveCheckoutReason, MAX_INLINE_RETRIES } from "@/lib/checkout/resolve-checkout-reason";
import { getTurnstileSiteKey } from "@/lib/security/get-turnstile-site-key";

import { getCachedMarketCatalog, getCachedPaySectionContent } from "../../data/get-cached-catalog";
import { CheckoutHeader } from "./components/checkout-header/CheckoutHeader";
import { OrderSummary } from "./components/order-summary/OrderSummary";
import { CheckoutForm } from "./components/checkout-form/CheckoutForm";
import { TransferCheckoutForm } from "./components/transfer-checkout/TransferCheckoutForm";

/**
 * صفحة إتمام الشراء (PAY-C3) — منقولة من جبر سيو `app/[country]/checkout/page.tsx`.
 *
 * عمودٌ واحد يُقرأ من أعلى إلى أسفل، لا ملخّصٌ جانبيّ: نفس نمط Stripe Checkout وورقة
 * Apple Pay. سببه أن لوح الدفع — «حدّ الثقة» — يحتاج المساحة كلّها، وعمودٌ جانبيّ يسرق
 * منه الانتباه في اللحظة التي يقرّر فيها المشتري تسليم بطاقته.
 *
 * والسعر هنا **يُحسب على السيرفر** من نفس الكتالوج ونفس `buildOrderSnapshot` الذي يستعمله
 * مسار الإنشاء. لو حُسب في المتصفّح لظهر رقمٌ قد يخالف ما يُخصم فعلاً.
 */

/**
 * السوقان يمرّان من هنا، ويفترقان عند **لوح الدفع** وحده.
 *
 * كانت `{ sa: "SA" }` وحدها، فكل ضغطةٍ على «ابدأ الحين» في صفحة مصر تسقط على
 * `notFound()` — ثلاثة أزرارٍ في ثلاث بطاقات، كلّها إلى **٤٠٤** (قيس حيّاً ١٥ سبتمبر
 * ٢٠٢٦ على `/eg/checkout?plan=…`). فصفحة الباقات كانت تبيع لمصر بابَ خطأ.
 *
 * وما فوق اللوح مشتركٌ عمداً: العنوان وملخّص الطلب والمبلغ والضريبة تُبنى من نفس
 * `buildOrderSnapshot` للسوقين. السوق يغيّر **كيف** يُدفع، لا **ماذا** يُشترى.
 */
const MARKETS = { sa: "SA", eg: "EG" } as const;
type MarketSlug = keyof typeof MARKETS;

export const instant = false;

export const metadata: Metadata = {
  title: { absolute: "إتمام الاشتراك — مدونتي" },
  description: "أكمل بياناتك واختر باقتك.",
  robots: { index: false, follow: false },
  // يرسم <meta name="google" content="notranslate"> — يمنع «ترجمة جوجل» من إعادة ترتيب
  // عقد النصّ أثناء الدفع، وهو ما كان يُسقط الصفحة بخطأ removeChild عند جبر.
  other: { google: "notranslate" },
};

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ plan?: string; months?: string; error?: string; attempt?: string; order?: string }>;
}) {
  const { market: slug } = await params;
  if (!(slug in MARKETS)) notFound();
  const market = MARKETS[slug as MarketSlug];

  const { plan: planParam, months: monthsParam, error: errorParam, attempt: attemptParam, order: orderParam } =
    await searchParams;

  // بلا باقة لا معنى للصفحة — يُعاد إلى حيث تُختار.
  if (!planParam?.trim()) redirect(`/${slug}/plans`);

  /**
   * سياسة إعادة المحاولة في المكان: سببٌ قابلٌ للعلاج يُعرض شريطاً ويُعاد إدخال البطاقة.
   * وبعد `MAX_INLINE_RETRIES` — أو عند سببٍ غير قابلٍ للعلاج — يُخرَج المشتري إلى `failed`
   * حيث مخرجٌ بشريّ. بلا هذا الحدّ تصير الصفحة حلقةً يعيد فيها المحاولة على سببٍ لن يتغيّر.
   */
  const attemptNumber = Math.max(1, Number.parseInt(attemptParam ?? "1", 10) || 1);
  const paymentError = errorParam ? resolveCheckoutReason(errorParam) : null;
  if (paymentError && (!paymentError.recoverable || attemptNumber >= MAX_INLINE_RETRIES)) {
    const q = new URLSearchParams({ reason: errorParam!, plan: planParam.trim(), months: String(monthsParam ?? "") });
    if (orderParam) q.set("order", orderParam);
    redirect(`/${slug}/checkout/failed?${q.toString()}`);
  }

  const [catalog, content] = await Promise.all([
    getCachedMarketCatalog(market),
    getCachedPaySectionContent(market),
  ]);

  const plan = catalog.plans.find((p) => p.slug === planParam.trim().toLowerCase());
  const paidMonths = Number.parseInt(monthsParam ?? "", 10);
  const term = catalog.terms.find((t) => t.paidMonths === paidMonths);
  // شريحةٌ أو مدّةٌ لا وجود لها في الكتالوج المنشور ⇒ رجوعٌ إلى الاختيار، لا انهيار.
  if (!plan || !term) redirect(`/${slug}/plans`);

  const snapshot = buildOrderSnapshot({
    plan: { id: plan.id, slug: plan.slug, name: plan.name, tier: plan.tier, articlesPerMonth: plan.articlesPerMonth },
    price: { market, currency: plan.currency, monthlyBase: plan.monthlyBase },
    term: { paidMonths: term.paidMonths, bonusServiceMonths: term.bonusServiceMonths },
    vatRateBp: vatRateBpForMarket(market),
  });

  const totalDisplay = formatCatalogMoneyMinor(snapshot.totalMinor, snapshot.currency);
  // أشهر الخدمة لا المدفوعة — نفس الرقم الذي وعدت به البطاقة. بطاقةٌ سعّرت «٧ شهور»
  // وصفحةٌ تسمّيها «٦» تجعل المشتري يصل ببطاقته وشهرٌ ناقص في ظنّه؛ كلا الرقمين صحيح
  // والتفسير علينا، فيُذكر الذي يستلمه هو.
  const serviceMonths = term.paidMonths + term.bonusServiceMonths;
  const ar = new Intl.NumberFormat("ar-SA");
  const billingLabel = `${ar.format(serviceMonths)} ${serviceMonths >= 3 && serviceMonths <= 10 ? "شهور" : "شهر"}`;

  return (
    <>
      <CheckoutHeader backHref={`/${slug}/plans`} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12" dir="rtl">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">أكمل اشتراكك</h1>
          <p className="mt-2 text-sm text-muted-foreground">خطوة واحدة تفصلك عن بدء النشر.</p>
        </div>

        <div className="space-y-5">
          <OrderSummary
            planName={plan.name}
            totalDisplay={totalDisplay}
            billingLabel={billingLabel}
            freeMonths={term.bonusServiceMonths}
            vatNote={content.vatNote}
          />

          {market === "EG" ? (
            /**
             * مصر بلا بوّابة بطاقات اليوم (PAY-Q12): يُسجَّل الطلب أوّلاً ثم تُعرض
             * بيانات التحويل ورقم الطلب. والترتيب مقصود — راجع
             * `app/api/checkout/bank-transfer/route.ts`.
             */
            <TransferCheckoutForm
              planSlug={plan.slug}
              planName={plan.name}
              paidMonths={term.paidMonths}
              totalDisplay={totalDisplay}
              turnstileSiteKey={getTurnstileSiteKey()}
              marketSlug={slug}
            />
          ) : (
          <CheckoutForm
            market={market}
            planSlug={plan.slug}
            planName={plan.name}
            paidMonths={term.paidMonths}
            totalDisplay={totalDisplay}
            paymentError={paymentError}
            attemptNumber={paymentError ? attemptNumber : undefined}
            turnstileSiteKey={getTurnstileSiteKey()}
            ngeniusHostedSessionKey={process.env.NEXT_PUBLIC_NGENIUS_HOSTED_SESSION_API_KEY ?? ""}
            ngeniusOutletRef={process.env.NGENIUS_OUTLET_ID ?? ""}
          />
          )}
        </div>
      </main>
    </>
  );
}
