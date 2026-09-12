import { DocLayout } from "@/app/(public)/components/doc-layout";

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

    </DocLayout>
  );
}
