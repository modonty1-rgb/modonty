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
 * **خانةٌ لكلّ شهرٍ منذ أوّل عميل — وفيها رقمان.**
 *
 * الأعلى **ما دخل** الخزينةَ في الشهر، والأسفل **ما استُحقّ** منه خدمةً. خالد
 * (١٩ سبتمبر ٢٠٢٦): «كم المفروض عندي من فلوس، وكم عندي من إيراد».
 *
 * والرقمان يفترقان كثيراً: سبتمبر ٢٠٢٦ دخلُه `43,031` واستحقاقُه `12,397` — لأنّ أربعين
 * طلباً من اثنين وسبعين مدّتُها سنة. فقراءةُ النقديّ وحده تجعل شهرَ التحصيل انفجاراً وما
 * بعده جدباً، وكلاهما وهم.
 */
export function MonthlyRevenueStrip({ data, totals }: { data: MonthlyRevenue; totals: CurrencyTotal[] }) {
  const lastKey = data.months[data.months.length - 1]?.key;

  return (
    <section className="rounded-lg border bg-card px-3 py-2" aria-label="الإيراد الشهريّ بالريال السعوديّ">
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">الشهور — بالريال</span>
        <span>
          <b className="text-foreground">دخل</b> ما وصل الخزينة ·{" "}
          <b className="text-primary">استُحقّ</b> ثمنُ خدمة الشهر
        </span>
        {data.fx.ok ? (
          <span title={data.fx.fetchedAt ?? undefined}>
            ريال = <span className="tabular-nums">{data.fx.egp?.toFixed(2) ?? "—"}</span> جنيه
          </span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400">تعذّر سعرُ الصرف — ريالاتٌ فقط</span>
        )}
        {data.unconverted.length > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            بلا سعرِ صرف: {data.unconverted.join(" · ")} — لم تُجمع
          </span>
        )}
      </div>

      <ol className="flex gap-1 overflow-x-auto pb-0.5">
        {data.months.map((m) => (
          <li
            key={m.key}
            className={`flex min-w-[64px] flex-1 flex-col items-center rounded-md py-1 hover:bg-accent ${
              m.key === lastKey ? "bg-primary/5 ring-1 ring-primary/30" : ""
            }`}
            title={`${m.label} ${m.year} — ${m.orders} طلباً قُبض مالُه`}
          >
            {/* اسمُ الشهر ترويسةً فوق رقمَيه (خالد ١٩ سبتمبر ٢٠٢٦: «طلّع لي الأشهر فوق») —
                فتُقرأ الخانةُ من عنوانها إلى قيمتها، لا من قيمةٍ يُبحث عن عنوانها بعدها. */}
            <span className="text-[9.5px] leading-none text-muted-foreground">
              {m.label}
              <span className="ms-0.5 tabular-nums opacity-70">{String(m.year).slice(2)}</span>
            </span>
            <span className={`mt-1 text-[13.5px] font-bold leading-none tabular-nums ${m.cashSarMinor ? "" : "text-muted-foreground/40"}`}>
              {formatSar(m.cashSarMinor)}
            </span>
            {/* المستحقُّ أصغرُ ولونُه مختلف — رقمان بنفس الوزن يجعلان الخانةَ تُقرأ مرّتين. */}
            <span className={`mt-0.5 text-[11.5px] leading-none tabular-nums ${m.accruedSarMinor ? "text-primary" : "text-muted-foreground/40"}`}>
              {formatSar(m.accruedSarMinor)}
            </span>
          </li>
        ))}
      </ol>

      {/**
        * إجماليّا السوقين — داخل الكرت لا فوق الجدول (خالد ١٩ سبتمبر ٢٠٢٦: «حطّه جوّا
        * الكرت عشان ما يكون فيه تشويش بصريّ»). كانا شريطاً مؤطّراً بجانب أدوات الجدول،
        * فصار على الشاشة إطاران متجاوران يحملان أرقامَ مالٍ بمعنيين مختلفين.
        */}
      <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-t pt-2 text-[11px] text-muted-foreground">
        <span>الإجماليّ لكلّ سوق بعملته</span>
        {totals.map((t) => (
          <span key={t.code} title={t.hint}>
            {t.market} <b className="text-[13px] tabular-nums text-foreground">{t.label}</b>
          </span>
        ))}
        {/**
          * مالٌ قُبض وخدمتُه لم تُقدَّم بعد — التزامٌ علينا لا إيرادٌ لنا. ويُذكر لأنّه
          * يفسّر لماذا يعلو مجموعُ الدخل على مجموع الاستحقاق: الفارقُ كلُّه هنا.
          */}
        {data.deferredSarMinor > 0 && (
          <span title="مقبوضٌ عن أشهرٍ قادمة — خدمتُها لم تُقدَّم بعد">
            محجوزٌ للقادم <b className="text-[13px] tabular-nums text-foreground">{formatSar(data.deferredSarMinor)}</b>
          </span>
        )}
        <span className="ms-auto" title="مجموعُ الأشهر أعلاه — دخلاً واستحقاقاً، بالريال">
          دخل <b className="text-[13px] tabular-nums text-foreground">{formatSar(data.totalCashSarMinor)}</b>
          <span className="mx-1.5 opacity-40">·</span>
          استُحقّ <b className="text-[13px] tabular-nums text-primary">{formatSar(data.totalAccruedSarMinor)}</b>
        </span>
      </div>
    </section>
  );
}

/** بلا كسورٍ ولا رمزِ عملة: الترويسةُ تقول «بالريال»، والكسرُ ضجيجٌ في رقمٍ بالآلاف. */
function formatSar(minor: number): string {
  return Math.round(minor / 100).toLocaleString("ar-EG", { maximumFractionDigits: 0 });
}
