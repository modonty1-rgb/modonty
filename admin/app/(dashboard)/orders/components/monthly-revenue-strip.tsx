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
  /** «ر.س» / «ج.م» بجانب الرقم — بلا وحدةٍ كان «١٨٠٬٤٦٨» يُقرأ ريالاً. */
  unit: string;
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
 * **قبضنا بالريال: هذا الشهر · الشهر الماضي · من البداية** — كاشٌ فقط (خالد ١ أكتوبر ٢٠٢٦ اختاره).
 * كان «دخل · استُحقّ · محجوز» ثم «قبضنا = خدمناه + باقي علينا»، ولم يُفهم أيٌّ منهما: تقسيمُ
 * المقبوض على أشهر الخدمة سؤالُ محاسب لا سؤالُ هذه الصفحة. والأصفارُ تبقى: الصفرُ جوابٌ لا غياب.
 */
export function MonthlyRevenueStrip({ data, totals }: { data: MonthlyRevenue; totals: CurrencyTotal[] }) {
  return (
    <section
      // بلا إطار: يجلس بجانب الفلاتر في صفّ العنوان، والإطارُ كان يجعله كرتاً ثانياً يزاحمها.
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
      aria-label="الإيراد الشهريّ بالريال السعوديّ"
    >
      {/* كلُّ سوقٍ بعملته — لا يُجمع ريالٌ على جنيه. */}
      <span className="font-semibold text-foreground">مبيعات كل سوق:</span>
      {totals.map((t) => (
        <span key={t.code} title={t.hint} className="flex items-baseline gap-1">
          {t.market}
          <b className="text-[13px] tabular-nums text-foreground">{t.label}</b>
          {t.unit}
        </span>
      ))}

      <span className="h-4 w-px bg-border" aria-hidden />

      {/* كاشٌ فقط، بالريال بسعر اليوم (والسعرُ في التلميح). الأشهرُ تنتهي بالشهر الجاري
          (`get-monthly-revenue.ts`)، فآخرُها هذا الشهر والذي قبله الماضي. */}
      <span
        className="font-semibold text-foreground"
        title={data.fx.ok ? `كل الأسواق محوّلة للريال · ريال = ${data.fx.egp?.toFixed(2) ?? "—"} جنيه` : "كل الأسواق محوّلة للريال"}
      >
        قبضنا بالريال:
      </span>
      {[
        { label: "هذا الشهر", minor: data.months.at(-1)?.cashSarMinor ?? 0, strong: true },
        { label: "الشهر الماضي", minor: data.months.at(-2)?.cashSarMinor ?? 0 },
        { label: "من البداية", minor: data.totalCashSarMinor },
      ].map((p) => (
        <span key={p.label} className="flex items-baseline gap-1">
          {p.label} <b className={`text-[13px] tabular-nums ${p.strong ? "text-primary" : "text-foreground"}`}>{formatSar(p.minor)}</b>
        </span>
      ))}
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
