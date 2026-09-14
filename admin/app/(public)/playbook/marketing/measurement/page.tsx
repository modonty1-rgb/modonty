import { DocLayout } from "@/app/(public)/components/doc-layout";
import { SectionHead } from "@/app/(public)/playbook/components/section-head";

/**
 * كانت الصفحة أربع بطاقات بلا عنوان ولا حدود (١٠٥ كلمات، صفر `h2`) — تقول من أين يأتي
 * الرقم ولا تقول متى لا يوجد رقم، ولا من يقرأه (خالد، ١٢ سبتمبر ٢٠٢٦).
 * وما أُضيف هنا مأخوذ من قرارات قائمة لا من إنشاء: حدود التقنية في `/playbook/tech`،
 * وإسناد القياس لأماني وقراءة التقرير الشهري لخالد في `/playbook/roles`.
 */
const measurement = [
  { title: "الظهور والفهرسة", source: "Google Search Console + فحص Sitemap", meaning: "هل ترى محركات البحث الصفحات؟ هل فُهرست؟ وما حجم الظهور والنقرات؟" },
  { title: "تفاعل المحتوى", source: "أحداث المقال والصفحة", meaning: "الزيارات والمشاهدات وأداء كل مقال وصفحة، وتطوره عبر الفترات." },
  { title: "التواصل والتحويل", source: "أحداث الكونسول: حجوزات وعملاء محتملون", meaning: "ما الذي ضغطه الزائر أو بدأه، وأين يحتاج المسار أو العرض تحسينًا؟" },
  { title: "تنفيذ الخدمة", source: "مراحل الإنتاج والاعتماد", meaning: "ما الذي ينتظر الفريق؟ ما الذي ينتظر الشريك؟ وأين تأخر التسليم؟" },
] as const;

export default function MarketingMeasurementPage() {
  return (
    <DocLayout
      parentHref="/playbook/marketing"
      parentLabel="قسم التسويق"
      title="القياس: ماذا نعرض ومن أين جاء الرقم"
      description="أربعة مصادر نقرأ منها، وكلها تُعرض بمصدرها. لا رقم تجميلي ولا حالة خضراء مزيفة."
    >
    <section className="mt-8 scroll-mt-6" id="measurement">
      <SectionHead title="أربعة مصادر نقرأ منها" hint="كل رقم يُعرض ومعه مصدره، فمن يسأل «من أين جاء؟» يجد الجواب في البطاقة نفسها." />
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {measurement.map((metric) => (
          <article key={metric.title} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[14px] font-bold">{metric.title}</h3>
            </div>
            <p className="mt-2 text-[12.5px] font-semibold leading-5 text-primary">{metric.source}</p>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{metric.meaning}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="mt-8 scroll-mt-6" id="not-measured">
      <SectionHead title="ما لا نقيسه" hint="غياب الرقم يُقال كما هو. الرقم المقدَّر أسوأ من لا رقم، لأنه يُبنى عليه قرار." />
      <ul className="mt-4 list-disc space-y-2 rounded-lg border border-rose-500/30 bg-rose-500/[0.05] p-4 pe-4 ps-8 text-[13.5px] leading-7 text-muted-foreground marker:text-rose-500/70">
        <li>ترتيب كلمة في نتائج البحث — نقرأ الظهور والنقرات، لا مركزًا نعد به.</li>
        <li>ما لا تلتقطه أنظمة القياس: مكالمة جاءت من المقال، أو زبون دخل المحلّ بعد قراءته.</li>
        <li>عائدٌ ماليّ للشريك — نقيس ما وصل إليه، لا ما أغلقه بعد ذلك.</li>
        <li>أثر قناة بعينها حين تعمل القنوات معًا. نقول «ارتفع» ولا ندّعي «بسبب هذه».</li>
      </ul>
    </section>

    <section className="mt-8 scroll-mt-6" id="who-reads">
      <SectionHead title="من يقرأ ماذا" />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          { who: "أماني", what: "أرقام الحملات يوميًا", why: "توقف ما لا يرجّع، وتزيد ما يرجّع." },
          { who: "روان", what: "تقرير الشريك عن صفحته", why: "تحوّل الرقم إلى كلام يفهمه، لا لقطة شاشة." },
          { who: "خالد", what: "تقرير الشهر كاملًا", why: "قرارٌ عليه: أي قناة تُوقف، وأي خطّة تتغيّر." },
        ].map((row) => (
          <article key={row.who} className="rounded-lg border bg-card p-4">
            <h3 className="text-[14.5px] font-bold">{row.who}</h3>
            <p className="mt-1.5 text-[13px] font-bold text-primary">{row.what}</p>
            <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{row.why}</p>
          </article>
        ))}
      </div>
    </section>

    </DocLayout>
  );
}
