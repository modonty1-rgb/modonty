import { Check, Minus } from "lucide-react";

import type { FeatureMatrix, MatrixCell } from "../../lib/commercial/get-feature-matrix";
import { cn } from "../../lib/utils";

/**
 * جدول «ميزة × باقة» — كل ما في الكتالوج في شبكةٍ واحدة.
 *
 * ليش هو موجود: البطاقة تُري المشتري ما يأخذ، والجدول يُريه **ما يفوته**. من يقرأ بطاقة
 * «الزخم» لا يعرف أن «مدير حساب مخصص» و«تقرير سيو شامل» موجودان أصلاً — فلا يشتهيهما.
 *
 * ولا نصّ بيع هنا: الأسماء والمقادير والوحدات كلّها من `getFeatureMatrix`. صفر حرفٍ
 * مكتوبٍ في هذا الملفّ عن باقةٍ أو ميزة.
 *
 * سيرفر كومبوننت بلا حالة: الجدول لا يُطوى ولا يُرشَّح — كل تفاعلٍ هنا يعني جافاسكربت
 * على أثقل قسمٍ في الصفحة مقابل لا شيء. والتمرير الأفقي على الجوّال يفعله المتصفّح.
 */

function Cell({ cell }: { cell: MatrixCell }) {
  switch (cell.kind) {
    case "quantity":
      return (
        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
          <span className="text-[15px] font-bold tabular-nums text-foreground">{cell.quantity}</span>
          {cell.unitLabel ? (
            <span className="text-[11px] text-muted-foreground">{cell.unitLabel}</span>
          ) : null}
        </span>
      );
    case "note":
      return <span className="text-[12.5px] leading-snug text-foreground">{cell.note}</span>;
    case "included":
      /* أيقونة لا كلمة «نعم»: العين تمسحها في عمودٍ من ١٧ صفّاً أسرع من قراءة نصّ. */
      return <Check className="mx-auto size-[18px] text-success" strokeWidth={2.75} aria-label="مشمولة" />;
    case "absent":
      /* شرطة باهتة لا فراغ: الفراغ يُقرأ «نسينا»، والشرطة تقول «ليست في هذه الباقة». */
      return <Minus className="mx-auto size-[18px] text-muted-foreground/40" strokeWidth={2.5} aria-label="غير مشمولة" />;
  }
}

export function FeatureMatrixTable({
  matrix,
  planHref,
  ctaLabel = "اختر هذه الباقة",
  className,
}: {
  matrix: FeatureMatrix;
  /** رابط الباقة — يبقى خارج المكوّن لأن كل تطبيق يعرف مساره. */
  planHref: (planSlug: string) => string;
  ctaLabel?: string;
  className?: string;
}) {
  const { plans, rows, featureCount } = matrix;
  if (plans.length === 0 || rows.length === 0) return null;

  return (
    <section className={cn("mx-auto w-full max-w-5xl px-4", className)} dir="rtl">
      <div className="mb-6 text-center">
        <h2 className="text-[22px] font-black text-foreground sm:text-[26px]">قارن الباقات</h2>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {featureCount} ميزة، وما تشمله كل باقة منها
        </p>
      </div>

      {/* الحاضن يمرّر أفقياً وحده على الجوّال: ثلاثة أعمدة + عمود الأسماء لا تدخل ٣٩٠px،
          والبديل (طيّ الأعمدة) يخفي بالضبط ما جاء الزائر ليقارنه. */}
      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card/30">
        <table className="w-full min-w-[640px] border-collapse text-right">
          <caption className="sr-only">مقارنة مزايا الباقات</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="w-[38%] px-4 py-4 text-right text-[12px] font-semibold text-muted-foreground">
                الميزة
              </th>
              {plans.map((p) => (
                <th key={p.id} scope="col" className="px-3 py-4 text-center align-top">
                  <span className="block text-[15px] font-black text-foreground">{p.name}</span>
                  <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
                    {p.includedCount} من {featureCount} ميزة
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.featureId}
                className={cn("border-b border-border/40 last:border-0", i % 2 === 1 && "bg-muted/25")}
              >
                <th scope="row" className="px-4 py-3.5 text-right align-middle font-normal">
                  <span className={cn("text-[13px] leading-snug", r.isHighlighted ? "font-bold text-foreground" : "text-foreground/90")}>
                    {r.name}
                  </span>
                  {r.description ? (
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{r.description}</span>
                  ) : null}
                </th>
                {r.cells.map((c, j) => (
                  <td key={plans[j].id} className="px-3 py-3.5 text-center align-middle">
                    <Cell cell={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          {/* الزرّ في أسفل العمود لا في أعلاه: من وصل إلى آخر ١٧ صفّاً قرّر، والزرّ
              تحت العمود الذي قرأه — لا يحتاج أن يرجع إلى الأعلى ليضغط. */}
          <tfoot>
            <tr className="border-t border-border">
              <td className="px-4 py-4" />
              {plans.map((p) => (
                <td key={p.id} className="px-3 py-4 text-center">
                  <a
                    href={planHref(p.slug)}
                    className="inline-flex h-11 items-center justify-center rounded-xl border-2 border-foreground/25 bg-secondary px-4 text-[12.5px] font-bold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                  >
                    {ctaLabel}
                  </a>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
