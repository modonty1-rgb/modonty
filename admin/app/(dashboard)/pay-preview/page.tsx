import Link from "next/link";
import { PaySection } from "@modonty/shared/components/commercial/pay-section";
import { getMarketCatalog } from "@modonty/shared/lib/commercial/get-market-catalog";
import { getPaySectionContent } from "@modonty/shared/lib/commercial/get-pay-section-content";
import { TERM_PARAM, resolveTermFromParams } from "@modonty/shared/lib/commercial/resolve-term-from-params";
import { isPayMarkName, payMarkAsset } from "@modonty/shared/lib/commercial/pay-mark-names";

import { db } from "@/lib/db";

/**
 * معاينة صفحة الدفع — ليست شبيهةً بها، هي هي.
 *
 * كل ما داخل «شاشة الزائر» يُرسم بـ`PaySection` المشترك، وهو نفسه الذي ستستدعيه `/pay`
 * في `PAY-C2`. فتعديلٌ على المكوّن يظهر في الاثنتين معاً، ولا توجد نسخة ثانية تتباعد.
 * خالد (١٣ سبتمبر ٢٠٢٦): «نفس الكومبوننت… أتأكد مليون في المئة إنه يكون هناك».
 *
 * ما تملكه هذه الصفحة وحدها: شريط أدمن نحيف فيه ما لا يراه الزائر أبداً (اختيار السوق —
 * فالبروكسي يختاره بدولة الزائر)، وزرٌّ معطَّل لأن المعاينة لا تبيع.
 */

export const dynamic = "force-dynamic"; // المعاينة تقرأ الصفّ الحيّ — تعديلٌ لا يظهر فوراً يفقدها معناها

// السطر الضريبي ادّعاءٌ عن قانون سوق: السعودية ١٥٪ شاملة (PAY-Q7)، ومصر غير مقيسة عمداً
// (PAY-UNKNOWN #5 — `vatRateBpForMarket` يرمي عليها)، فلا تُطبع عليها جملة بلا دليل.
// السوقان وحدهما هنا — وكل كلمة بيع صارت في القاعدة (PAY-G20)، تُحرَّر من شاشة
// «كلام صفحة البيع». لم يبقَ في هذا الملفّ ادّعاءٌ تجاريّ ولا قانونيّ.
const MARKETS = [
  { code: "SA", label: "السعودية" },
  { code: "EG", label: "مصر" },
] as const;

export default async function PayPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ market?: string; months?: string; duration?: string }>;
}) {
  const params = await searchParams;
  const selectedMarket = MARKETS.find((m) => m.code === params.market) ?? MARKETS[0];
  const market = selectedMarket.code;

  const [catalog, content] = await Promise.all([getMarketCatalog(db, market), getPaySectionContent(db, market)]);
  const selectedTerm = resolveTermFromParams(catalog.terms, params);

  return (
    <div className="flex flex-col gap-2 p-3">
      {/* شريط الأدمن: سطر واحد فيه ما لا يراه الزائر. السوق منه لا من الشاشة. */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">معاينة</span>
        {MARKETS.map((m) => (
          <Link
            key={m.code}
            href={`/pay-preview?market=${m.code}&${TERM_PARAM}=${selectedTerm?.paidMonths ?? ""}`}
            aria-current={m.code === market ? "true" : undefined}
            className={
              m.code === market
                ? "rounded bg-foreground px-2 py-0.5 font-semibold text-background"
                : "rounded border px-2 py-0.5 hover:bg-muted"
            }
          >
            {m.label}
          </Link>
        ))}
        <span>· {catalog.plans.length} باقة منشورة</span>
        <Link href="/commercial-plans" className="ms-auto underline underline-offset-2">الباقات</Link>
        <Link href="/commercial-features" className="underline underline-offset-2">المزايا</Link>
      </div>

      {/* شاشة الزائر — لا شيء من الأدمن بداخلها.
          `dir="rtl"` على الإطار لا على الصفحة: مدونتي تعمل بـrtl (modonty/app/layout.tsx:87)
          والأدمن بلا `dir` إطلاقاً. فبدونه كانت البطاقات تُرسم من اليسار — والترتيب جزءٌ من
          التصميم لا زينة: «الانطلاقة» يجب أن تكون أوّل ما تقع عليه عين القارئ العربي. */}
      <div dir="rtl" className="pay-stage rounded-lg border bg-background px-4 py-5 text-foreground">
        <PaySection
          catalog={catalog}
          content={content}
          selectedTerm={selectedTerm}
          termHref={(paidMonths) => `/pay-preview?market=${market}&${TERM_PARAM}=${paidMonths}`}
          priceNote={content.vatNote}
          ctaLabel="اشترك الآن"
          ctaDisabled
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
          emptyState={
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="font-semibold">لا باقة منشورة لها سعر مفعَّل في هذا السوق</p>
              <p className="mt-1 text-sm text-muted-foreground">انشر باقةً وأضف لها سعراً للسوق من صفحة الباقات والأسعار.</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
