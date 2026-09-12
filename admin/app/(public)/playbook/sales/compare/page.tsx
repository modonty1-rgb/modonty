import { DocLayout } from "@/app/(public)/components/doc-layout";
import { getMomentumPrice } from "@/lib/pricing/format-for-guideline";
import { comparisonRows, sixBattles, whenNotFit } from "@/app/(public)/playbook/what-is-modonty-helpers/positioning";

export default async function SalesComparePage() {
  const momentum = await getMomentumPrice("SA");
  const edgePrice = momentum?.monthly
    ? `نظام يعمل على مدار الساعة، ويتراكم مع كل شريك جديد، بسعر ${momentum.monthly} ريال شهريًا.`
    : "نظام يعمل على مدار الساعة، ويتراكم مع كل شريك جديد، بسعر الباقة الشهري.";
  const wordpressYearly = `${(18000 * 12).toLocaleString("en-GB")}+ ريال سنويًا مع فريق تطوير وتصميم وكتابة وسيو بأقل الأسعار`;
  const battles = sixBattles.map((battle) => ({
    ...battle,
    edge: battle.edge === "__EDGE_PRICE__" ? edgePrice : battle.edge,
    rivalCost: battle.rivalCost === "__WORDPRESS_YEARLY__" ? wordpressYearly : battle.rivalCost,
  }));

  return (
    <DocLayout
      parentHref="/playbook/sales"
      parentLabel="قسم المبيعات"
      title="فيمَ نختلف عمّن حولنا"
      description="ست مقارنات يسمعها المندوب كل أسبوع، وجدول الفرق، وثلاث حالات لا نناسبها."
    >
    <section className="mt-8 scroll-mt-6" id="comparison">
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {battles.map((battle) => (
          <article key={battle.num} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-2 border-b pb-2.5">
              <h3 className="text-[15px] font-bold">
                <span className="ms-2 font-mono text-[12px] text-muted-foreground">{battle.num}</span>
                {battle.rival}
              </h3>
              <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[12px] font-semibold text-muted-foreground">{battle.rivalCost}</span>
            </div>
            <dl className="mt-3 space-y-2 text-[13.5px]">
              <div className="flex gap-2.5">
                <dt className="w-16 shrink-0 font-bold text-rose-700 dark:text-rose-300">ضعفه</dt>
                <dd className="leading-6 text-muted-foreground">{battle.rivalWeakness}</dd>
              </div>
              <div className="flex gap-2.5">
                <dt className="w-16 shrink-0 font-bold text-emerald-700 dark:text-emerald-300">قوّتنا</dt>
                <dd className="leading-6 text-muted-foreground">{battle.edge}</dd>
              </div>
            </dl>
            <p className="mt-3 rounded-md bg-primary/[0.06] px-3 py-2 text-[13.5px] font-semibold leading-6 text-primary">{battle.keyLine}</p>
          </article>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border">
        <div className="border-b bg-card px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-bold">جدول الفرق</h3>
          </div>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground">لا تقرأه للشريك سطرًا سطرًا. خذ منه السطر الذي يخص سؤاله.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-right text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2.5 font-bold">المعيار</th>
                <th className="px-3 py-2.5 font-semibold text-muted-foreground">وكالة</th>
                <th className="px-3 py-2.5 font-semibold text-muted-foreground">مستقل</th>
                <th className="px-3 py-2.5 font-semibold text-muted-foreground">WordPress</th>
                <th className="px-3 py-2.5 font-semibold text-muted-foreground">أدوات ذكاء</th>
                <th className="px-3 py-2.5 font-semibold text-muted-foreground">SaaS عالمي</th>
                <th className="bg-primary/[0.07] px-3 py-2.5 font-bold text-primary">مدونتي</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.criterion} className="border-b last:border-0">
                  <th className="px-3 py-2.5 text-right font-semibold">{row.criterion}</th>
                  <td className="px-3 py-2.5 text-muted-foreground">{row.agency}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{row.freelance}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{row.wordpress}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{row.ai}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{row.saas}</td>
                  <td className="bg-primary/[0.04] px-3 py-2.5 font-medium">{row.modonty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-bold">ثلاث حالات لا نناسبها</h3>
        </div>
        <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">قول «لسنا الأنسب لك» في وقته يحمي سمعتنا أكثر من صفقة تفشل بعد شهرين.</p>
        <div className="mt-3 grid gap-2.5 lg:grid-cols-3">
          {whenNotFit.map((item) => (
            <div key={item.title} className="rounded-md border bg-background/60 p-3">
              <p className="text-[13.5px] font-bold">{item.title}</p>
              <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">{item.why}</p>
              <p className="mt-1.5 text-[12.5px] leading-6 text-foreground/80"><b>ماذا تفعل:</b> {item.redirect}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    </DocLayout>
  );
}
