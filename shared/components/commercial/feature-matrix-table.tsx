import type { ReactNode } from "react";

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
  emptyState = null,
}: {
  matrix: FeatureMatrix;
  /** رابط الباقة — يبقى خارج المكوّن لأن كل تطبيق يعرف مساره. */
  planHref: (planSlug: string) => string;
  ctaLabel?: string;
  className?: string;
  /**
   * ما يُعرض حين لا باقة منشورة — بدل `return null` الصامت.
   * كان الجدول يختفي فتبقى الصفحة عنواناً وزرّاً يقود إلى فراغ، بلا أثرٍ يدلّ على السبب.
   */
  emptyState?: ReactNode;
}) {
  const { plans, rows, featureCount } = matrix;
  if (plans.length === 0 || rows.length === 0) return emptyState ?? null;

  /**
   * الصفوف التي تتساوى فيها الباقات تخرج من الجدول إلى سطرٍ واحد فوقه (خالد ١٥ سبتمبر ٢٠٢٦).
   *
   * من نزل إلى الجدول يسأل **«إيش الفرق»** لا «إيش عندكم» — وخمسة صفوف كل خلاياها ✓ تجيب
   * السؤال الثاني وتؤخّر الأوّل. وبإخراجها يقصر الجدول الثلث وتبقى المقارنة وحدها فيه.
   *
   * والمشترك لا يُحذف: يُقرأ في سطرٍ واحد **مكسباً للجميع** — وهو أقوى من ثلاث علاماتٍ
   * متكرّرة، لأن «كل الباقات تشمل» وعدٌ، والعلامات جرد.
   *
   * والحساب من البيانات لا من قائمة: صفٌّ كل خلاياه `included` يصعد. فميزةٌ تُضاف لباقةٍ
   * واحدة تنزل إلى الجدول وحدها، وميزةٌ تُعمَّم على الثلاث تصعد — بلا تعديل كود.
   */
  const isCommon = (r: (typeof rows)[number]) =>
    plans.length > 1 && r.cells.every((c) => c.kind === "included");
  const common = rows.filter(isCommon);
  const different = rows.filter((r) => !isCommon(r));
  // لو صار الجدول فارغاً (الباقات متطابقة) يُعرض الكلّ بدل جدولٍ بلا صفوف.
  const body = different.length > 0 ? different : rows;
  const shared = different.length > 0 ? common : [];

  return (
    <section id="قارن" className={cn("mx-auto w-full max-w-5xl scroll-mt-20 px-4", className)} dir="rtl">
      <div className="mb-6 text-center">
        <h2 className="text-[22px] font-black text-foreground sm:text-[26px]">قارن الباقات</h2>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {featureCount} ميزة، وما تشمله كل باقة منها
        </p>
      </div>

      {shared.length > 0 ? (
        <p className="mb-4 rounded-xl border border-success/25 bg-success/5 px-4 py-3 text-center text-[13px] leading-relaxed text-foreground">
          <span className="font-bold">كل الباقات تشمل:</span>{" "}
          <span className="text-foreground/85">{shared.map((r) => r.name).join(" · ")}</span>
        </p>
      ) : null}

      {/* ══ الجوّال: باقةٌ واحدة في كل مرّة ══
          (خالد ١٥ سبتمبر ٢٠٢٦، بعد قياس `chatgpt.com/pricing` على ٣٧٥px: لا `<table>`
          عندهم أصلاً ولا تمرير أفقي — عمودان فقط ومبدّلٌ لاصق أسفل الشاشة مع زرّ الشراء.)

          كان جدولنا يُمرَّر ٢٩٩px أفقياً على ٣٧٥px، وهو تمريرٌ لا يتوقّعه أحد في صفحة
          ويحتاج إصبعين ليقارن عمودين. والبديل هنا: الميزة وقيمتها في سطر، والتبديل
          بين الباقات من شريطٍ يبقى تحت الإبهام.

          ── وبلا جافاسكربت ──
          أزرار راديو مخفيّة + قواعد `:checked ~` مولَّدة أدناه. فالمكوّن يبقى سيرفر
          كومبوننت والصفحة ساكنة — والتبديل يفعله المتصفّح لا React.

          ⚠ والراديو `sr-only` أي **١×١px**، فحلقة التركيز عليه غير مرئيّة (قيس ١٥ سبتمبر
          ٢٠٢٦: `outline: auto 0.67px` على عنصرٍ لا يُرى) — وهو رسوب WCAG 2.4.7. فقاعدة
          `:focus-visible~` أدناه تنقل الحلقة إلى **اللسان** الذي يراه المستخدم. */}
      <div className="md:hidden">
        <style
          dangerouslySetInnerHTML={{
            /* الإخفاء الأساسي في الورقة لا في `style` على العنصر: النمط المضمّن يغلب
               ورقة الأنماط، فكان `display:none` يبقى ولا يظهر أي زرّ. */
            __html: `[data-mx-cta]{display:none}
` + plans
              .map(
                (p) => `#mxp-${p.id}{display:none}
#mx-${p.id}:checked~[data-mx-panels] #mxp-${p.id}{display:block}
#mx-${p.id}:checked~[data-mx-bar] [data-mx-cta="${p.id}"]{display:flex}
#mx-${p.id}:checked~[data-mx-bar] label[for="mx-${p.id}"]{background:hsl(var(--card));color:hsl(var(--foreground));box-shadow:0 1px 3px rgb(0 0 0/.12)}
#mx-${p.id}:focus-visible~[data-mx-bar] label[for="mx-${p.id}"]{outline:2px solid hsl(var(--foreground));outline-offset:2px}`,
              )
              .join("\n"),
          }}
        />

        {plans.map((p, i) => (
          <input
            key={p.id}
            type="radio"
            name="mx-plan"
            id={`mx-${p.id}`}
            defaultChecked={i === 0}
            className="sr-only"
            aria-label={p.name}
          />
        ))}

        <div data-mx-panels className="rounded-2xl border border-border/60 bg-card/30 p-4 pb-2">
          {plans.map((p, i) => (
            <div key={p.id} id={`mxp-${p.id}`}>
              <p className="mb-3 border-b border-border pb-3 text-center text-[15px] font-black text-foreground">
                {p.name}
                <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
                  {p.includedCount} من {featureCount} ميزة
                </span>
              </p>
              <dl>
                {body.map((r) => (
                  <div
                    key={r.featureId}
                    className="flex items-center justify-between gap-3 border-b border-border/40 py-3 last:border-0"
                  >
                    <dt className={cn("text-[13px] leading-snug", r.isHighlighted ? "font-bold text-foreground" : "text-foreground/90")}>
                      {r.name}
                    </dt>
                    <dd className="shrink-0 text-left">
                      <Cell cell={r.cells[i]} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        {/* الشريط لاصقٌ أسفل الشاشة: القرار تحت الإبهام في كل لحظة، فلا يعود الزائر
            إلى أعلى الصفحة ليبدّل أو يشتري. و`bottom-3` يبقيه فوق شريط المتصفّح.

            و`--fab-bottom` يرفع زرّ الواتساب العائم فوقه: بدونه كان يغطّي ٤٧×٤٨px من
            زرّ الشراء، فتُفتح محادثةٌ بدل الشراء. القيمة = ارتفاع الشريط + هامشه. */}
        <div data-mx-bar className="sticky bottom-3 z-50 mt-3 rounded-2xl border border-border bg-background/95 p-2 shadow-[0_-4px_20px_-8px_rgba(0,0,0,.25)] backdrop-blur">
          <div className="grid gap-1 rounded-xl bg-muted p-1" style={{ gridTemplateColumns: `repeat(${plans.length}, minmax(0,1fr))` }}>
            {plans.map((p) => (
              <label
                key={p.id}
                htmlFor={`mx-${p.id}`}
                className="cursor-pointer rounded-lg px-2 py-2.5 text-center text-[12.5px] font-bold text-muted-foreground transition-colors"
              >
                {p.name}
              </label>
            ))}
          </div>
          {plans.map((p) => (
            <a
              key={p.id}
              data-mx-cta={p.id}
              href={planHref(p.slug)}
              className="mt-2 h-12 items-center justify-center rounded-xl bg-foreground text-[14px] font-black text-background no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {ctaLabel} — {p.name}
            </a>
          ))}
        </div>
      </div>

      {/* ══ الديسكتوب: الجدول كاملاً ══ */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border/60 bg-card/30 md:block">
        <table className="w-full min-w-[640px] border-collapse text-right">
          <caption className="sr-only">مقارنة مزايا الباقات</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="sticky start-0 z-10 w-[38%] bg-card px-4 py-4 text-right text-[12px] font-semibold text-muted-foreground">
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
            {body.map((r, i) => (
              <tr
                key={r.featureId}
                /* `[&>th]:bg-*` كي يرث العمود اللاصق خلفيّة صفّه: بخلفيّةٍ واحدة يشفّ ما
                   تحته أثناء التمرير فتتراكب الأرقام على الأسماء. */
                className={cn(
                  "border-b border-border/40 last:border-0",
                  i % 2 === 1 ? "bg-muted/25 [&>th]:bg-[color-mix(in_oklch,hsl(var(--muted))_25%,hsl(var(--card)))]" : "[&>th]:bg-card",
                )}
              >
                <th
                  scope="row"
                  /**
                   * ملتصقٌ أثناء التمرير الأفقي (قياس ١٥ سبتمبر ٢٠٢٦ على ٣٩٠px).
                   * الجدول ٦٤٠px في حاضنٍ ٣٤١px، فيمرّر ٢٩٩px — وعند آخر التمرير كان عمود
                   * الأسماء **يخرج من الشاشة تماماً** (`413→657` خارج ٣٧٥)، فيبقى الزائر
                   * أمام أرقامٍ لا يعرف لأيّ ميزة هي. و`start-0` لا `left-0`: الاتجاه RTL.
                   */
                  className="sticky start-0 z-10 bg-card px-4 py-3.5 text-right align-middle font-normal"
                >
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
              <td className="sticky start-0 z-10 bg-card px-4 py-4" />
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
