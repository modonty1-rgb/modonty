import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import type { MonthlyRevenue } from "../helpers/get-monthly-revenue";

/**
 * إجماليُّ كلّ سوقٍ على حدة — ولا يُجمع ريالٌ على جنيه أبداً (قاعدة المال).
 *
 * **ولا يتبع الفلتر** (خالد ١٩ سبتمبر ٢٠٢٦: «الإجمالي، مصر والسعودية مفروض يجي الاثنين،
 * ما لها علاقة بالتوغل»). كان محسوباً على الصفوف التي جلبها الفلتر، فالضغطُ على سوقٍ
 * يُنزل إجماليَّ الآخر إلى صفر — ورقمٌ يختفي بضغطةٍ يُقرأ خسارةً لا ترشيحاً.
 *
 * ويُجمَع بالسوق لا بالعملة: الإماراتُ تُسعَّر بالريال السعوديّ، فالجمعُ بالعملة يذيبها
 * في السعودية.
 */
export interface CurrencyTotal {
  /** رمزُ السوق — مفتاحٌ للعرض فقط، والجمعُ تمّ في الخادم. */
  code: string;
  market: string;
  /** يقول العملةَ حين لا يكفي اسمُ البلد — سوقان بالريال نفسِه. */
  hint: string;
  label: string;
}

/**
 * **سطرُ الإجماليّات وحده، والتفاصيلُ في تقرير المبيعات** (خالد ٢٣ سبتمبر ٢٠٢٦: «نعرض بس
 * الإجماليات، وإذا احتجنا التفاصيل سهمٌ يودّينا لتقرير المبيعات»).
 *
 * كانت خانةٌ لكلّ شهرٍ برقمين فوق الجدول — تقريرٌ كاملٌ في صفحةٍ سؤالُها «مَن اشترى». والشهورُ
 * هناك (`/clients/sales-report`)، وبنفس شرط المال (`lib/orders/revenue-order.ts`) فالسهمُ لا
 * يوصل إلى رقمٍ آخر — مقيسٌ: «مصر ١٠٩٬١٢٩ · السعودية ٢٬٣٩٤» هنا = `EGP 109,129 · SAR 2,394` هناك.
 *
 * **دخل** ما وصل الخزينة · **استُحقّ** ثمنُ خدمةٍ قُدّمت · **محجوز** مقبوضٌ عن أشهرٍ قادمة —
 * والفارقُ بين الأوّلين كلُّه في الثالث.
 */
export function MonthlyRevenueStrip({ data, totals }: { data: MonthlyRevenue; totals: CurrencyTotal[] }) {
  return (
    <section
      // بلا إطار: يجلس بجانب الفلاتر في صفّ العنوان، والإطارُ كان يجعله كرتاً ثانياً يزاحمها.
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground"
      aria-label="الإيراد الشهريّ بالريال السعوديّ"
    >
      {/* كلُّ سوقٍ بعملته — لا يُجمع ريالٌ على جنيه. */}
      {totals.map((t) => (
        <span key={t.code} title={t.hint} className="flex items-baseline gap-1">
          {t.market}
          <b className="text-[13px] tabular-nums text-foreground">{t.label}</b>
        </span>
      ))}

      <span className="h-4 w-px bg-border" aria-hidden />

      {/* سعرُ الصرف في التلميح — «بالريال» تكفي السطر، والسعرُ لمن يسأل. */}
      <span
        className="flex items-baseline gap-1"
        title={data.fx.ok ? `ما وصل الخزينة — بالريال · ريال = ${data.fx.egp?.toFixed(2) ?? "—"} جنيه` : "ما وصل الخزينة — بالريال"}
      >
        دخل <b className="text-[13px] tabular-nums text-foreground">{formatSar(data.totalCashSarMinor)}</b>
      </span>
      <span className="flex items-baseline gap-1" title="ثمنُ خدمةٍ قُدّمت — بالريال">
        استُحقّ <b className="text-[13px] tabular-nums text-primary">{formatSar(data.totalAccruedSarMinor)}</b>
      </span>
      {data.deferredSarMinor > 0 ? (
        <span className="flex items-baseline gap-1" title="مقبوضٌ عن أشهرٍ قادمة — خدمتُها لم تُقدَّم بعد — بالريال">
          محجوز <b className="text-[13px] tabular-nums text-foreground">{formatSar(data.deferredSarMinor)}</b>
        </span>
      ) : null}
      <span className="text-[10px]">بالريال</span>
      {!data.fx.ok ? <span className="text-amber-600 dark:text-amber-400">تعذّر سعرُ الصرف — ريالاتٌ فقط</span> : null}
      {data.unconverted.length > 0 ? (
        <span className="text-amber-600 dark:text-amber-400">بلا سعرِ صرف: {data.unconverted.join(" · ")}</span>
      ) : null}

      <Link
        href="/clients/sales-report"
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-primary hover:bg-primary/10"
      >
        التفاصيل
        <ArrowLeft className="size-3.5" aria-hidden />
      </Link>
    </section>
  );
}

/** بلا كسورٍ ولا رمزِ عملة: الترويسةُ تقول «بالريال»، والكسرُ ضجيجٌ في رقمٍ بالآلاف. */
function formatSar(minor: number): string {
  return Math.round(minor / 100).toLocaleString("ar-EG", { maximumFractionDigits: 0 });
}
