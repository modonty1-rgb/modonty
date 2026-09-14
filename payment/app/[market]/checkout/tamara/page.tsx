import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { formatCatalogMoneyMinor } from "@modonty/shared/lib/commercial/format-money";
import { buildOrderSnapshot } from "@modonty/shared/lib/payments/build-order-snapshot";
import { vatRateBpForMarket } from "@modonty/shared/lib/payments/vat-rate";
import { getTurnstileSiteKey } from "@/lib/security/get-turnstile-site-key";

import { getCachedMarketCatalog, getCachedPaySectionContent } from "../../../data/get-cached-catalog";
import { CheckoutHeader } from "../components/checkout-header/CheckoutHeader";
import { OrderSummary } from "../components/order-summary/OrderSummary";
import { TamaraForm } from "./components/tamara-form/TamaraForm";

/**
 * صفحة التقسيط (PAY-D6) — منقولة من جبر سيو `checkout/tamara/page.tsx`.
 *
 * نفس الطلب ونفس الإجمالي ونفس الأشهر المجانية، بطريقة دفعٍ أخرى. ولذلك تُعرض عليه نفس
 * بطاقة الملخّص حرفياً: مشتري التقسيط يشتري ما يشتريه مشتري البطاقة تماماً.
 */

export const metadata: Metadata = {
  title: { absolute: "قسّط اشتراكك — مدونتي" },
  robots: { index: false, follow: false },
  other: { google: "notranslate" },
};

export const instant = false;

const MARKETS = { sa: "SA" } as const;
type MarketSlug = keyof typeof MARKETS;

export default async function TamaraCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ plan?: string; months?: string }>;
}) {
  const { market: slug } = await params;
  if (!(slug in MARKETS)) notFound();
  const market = MARKETS[slug as MarketSlug];

  const { plan: planParam, months: monthsParam } = await searchParams;
  if (!planParam?.trim()) redirect(`/${slug}`);

  const [catalog, content] = await Promise.all([
    getCachedMarketCatalog(market),
    getCachedPaySectionContent(market),
  ]);

  const plan = catalog.plans.find((p) => p.slug === planParam.trim().toLowerCase());
  const paidMonths = Number.parseInt(monthsParam ?? "", 10);
  const term = catalog.terms.find((t) => t.paidMonths === paidMonths);
  if (!plan || !term) redirect(`/${slug}`);

  const snapshot = buildOrderSnapshot({
    plan: { id: plan.id, slug: plan.slug, name: plan.name, tier: plan.tier, articlesPerMonth: plan.articlesPerMonth },
    price: { market, currency: plan.currency, monthlyBase: plan.monthlyBase },
    term: { paidMonths: term.paidMonths, bonusServiceMonths: term.bonusServiceMonths },
    vatRateBp: vatRateBpForMarket(market),
  });

  const totalDisplay = formatCatalogMoneyMinor(snapshot.totalMinor, snapshot.currency);
  const serviceMonths = term.paidMonths + term.bonusServiceMonths;
  const ar = new Intl.NumberFormat("ar-SA");
  const billingLabel = `${ar.format(serviceMonths)} ${serviceMonths >= 3 && serviceMonths <= 10 ? "شهور" : "شهر"}`;

  return (
    <>
      {/* رجوعٌ إلى الباقات لا إلى صفحة البطاقة: المشتري اختار التقسيط من البطاقة نفسها،
          فهناك يعود إن غيّر رأيه. */}
      <CheckoutHeader backHref={`/${slug}`} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12" dir="rtl">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">قسّط اشتراكك مع تمارا</h1>
          <p className="mt-2 text-sm text-muted-foreground">بياناتك، وبعدها تكمّل على صفحة تمارا وترجع لنا.</p>
        </div>

        <div className="space-y-5">
          <OrderSummary
            planName={plan.name}
            totalDisplay={totalDisplay}
            billingLabel={billingLabel}
            freeMonths={term.bonusServiceMonths}
            vatNote={content.vatNote}
          />

          {/* التقسيم نفسه لا يُكتب هنا عمداً: تمارا تقرّر عدد الدفعات وأي رسمٍ من المبلغ
              ومن حساب المشتري نفسه، وصفحتها تذكر الجدول الحقيقي قبل أي تأكيد. وطبعُ مثالٍ
              هنا يضع رقماً لا نستطيع الوقوف خلفه بجانب رقمٍ نستطيع. */}
          <TamaraForm
            planSlug={plan.slug}
            planName={plan.name}
            paidMonths={term.paidMonths}
            totalDisplay={totalDisplay}
            marketSlug={slug}
            turnstileSiteKey={getTurnstileSiteKey()}
          />

          <p className="text-center text-xs text-muted-foreground">
            تفضّل الدفع دفعة واحدة بالبطاقة؟{" "}
            <a href={`/${slug}/checkout?plan=${plan.slug}&months=${term.paidMonths}`} className="text-foreground underline underline-offset-2">
              ارجع لصفحة الدفع بالبطاقة
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
