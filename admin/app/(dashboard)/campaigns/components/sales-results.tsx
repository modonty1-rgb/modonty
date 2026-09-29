import { cn } from "@/lib/utils";
import { LOST_LABEL, type LostReason } from "@/lib/sales/lost-reason";
import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";
import type { SalesResults as Results } from "../helpers/get-sales-results";

const ar = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });
const ar1 = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 });

/**
 * «نتائج المبيعات» على كرت البريف — ما يقرؤه الميديا باير ليعرف أيّ بريفٍ يجيب عملاء يتقفلون، لا
 * أرقاماً فقط (خالد ٢٩ سبتمبر ٢٠٢٦). القمع من المراحل وجودة العميل، والمال من الطلبات المدفوعة.
 * التكلفة من صرف ميتا؛ والعائد لا يُحسب إلا حين الصرف والمدفوع بعملةٍ واحدة — القسمة بين ريالٍ
 * وجنيه رقمٌ بلا معنى.
 */
export function SalesResults({ r, spend, spendCurrency }: { r: Results; spend: number | null; spendCurrency: string }) {
  const money = (n: number, c: string) => `${ar.format(n)} ${currencyLabel(c)}`;
  const paid = Object.entries(r.paidMinor).map(([c, minor]) => ({ c, amount: minor / 100 }));
  const paidInSpendCurrency = paid.find((p) => p.c === spendCurrency)?.amount ?? 0;
  const pct = (n: number) => (r.leads > 0 ? `${ar.format((n / r.leads) * 100)}٪` : "");
  const lost = (Object.entries(r.lost) as [LostReason, number][]).sort((a, b) => b[1] - a[1]);

  const steps: { label: string; n: number; tone?: string }[] = [
    { label: "عميل محتمل", n: r.leads },
    { label: "تواصلنا", n: r.contacted },
    { label: "مناسب", n: r.good, tone: "text-emerald-700 dark:text-emerald-400" },
    { label: "عرض سعر", n: r.quoted },
    { label: "تقفلت", n: r.closed, tone: "text-primary" },
  ];

  return (
    <section aria-label="نتائج المبيعات" className="space-y-1.5 rounded border border-dashed px-2.5 py-2 text-[11px]">
      <p className="font-semibold text-foreground">نتائج المبيعات</p>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {steps.map((s, i) => (
          <li key={s.label} className="flex items-center gap-1.5">
            {i > 0 ? <span className="text-muted-foreground" aria-hidden>←</span> : null}
            <span className={cn("font-semibold tabular-nums", s.tone)}>{ar.format(s.n)}</span>
            <span className="text-muted-foreground">
              {s.label}
              {i > 1 && r.leads > 0 ? ` (${pct(s.n)})` : ""}
            </span>
          </li>
        ))}
      </ol>
      <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
        {/* No spend yet (no Meta campaign carries the code) reads as «free» at ٠ — say nothing instead. */}
        {spend != null && spend > 0 && r.good > 0 ? <span>العميل المناسب بـ <b className="text-foreground">{money(spend / r.good, spendCurrency)}</b></span> : null}
        {spend != null && spend > 0 && r.closed > 0 ? <span>العقد بـ <b className="text-foreground">{money(spend / r.closed, spendCurrency)}</b></span> : null}
        <span>
          المدفوع فعلاً:{" "}
          <b className="text-foreground">{paid.length ? paid.map((p) => money(p.amount, p.c)).join(" + ") : "لا شيء بعد"}</b>
        </span>
        {spend != null && spend > 0 && paidInSpendCurrency > 0 ? (
          <span>
            العائد <b className="text-foreground">{ar1.format(paidInSpendCurrency / spend)}×</b> الصرف
          </span>
        ) : null}
      </p>
      {r.good + r.weak + r.invalid > 0 || lost.length > 0 ? (
        <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
          {r.good + r.weak + r.invalid > 0 ? (
            <span>
              الجودة: مناسب {ar.format(r.good)} · ضعيف {ar.format(r.weak)} · مو صالح {ar.format(r.invalid)}
              {r.contacted > r.good + r.weak + r.invalid ? ` · بلا تقييم ${ar.format(r.contacted - r.good - r.weak - r.invalid)}` : ""}
            </span>
          ) : null}
          {lost.length ? <span>ليش خسرنا: {lost.map(([k, n]) => `${LOST_LABEL[k]} ${ar.format(n)}`).join(" · ")}</span> : null}
        </p>
      ) : null}
    </section>
  );
}
