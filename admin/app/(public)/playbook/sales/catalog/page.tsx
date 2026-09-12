import { DocLayout } from "@/app/(public)/components/doc-layout";
import { SectionHead } from "@/app/(public)/playbook/components/section-head";

const serviceCatalog = [
  { title: "صفحة الشريك وهويتها", team: "نجهز الصفحة وأقسامها وهويتها المرئية داخل مدونتي.", client: "يسلم البيانات والأصول والوثائق، ثم يختار شكل الصفحة ويعتمدها.", boundary: "الأقسام والخيارات المتاحة تحددها الباقة. لا نبني موقعًا مستقلًا ولا نطورّ مزايا خاصة خارجها." },
  { title: "محتوى ومقالات", team: "نخطط ونكتب ونراجع وننشر وفق مسار الجودة والسيو.", client: "يزودنا بحقيقة الخدمة، يراجع، ويعتمد النشر.", boundary: "عدد المقالات والتعديلات والجدول الزمني مكتوب صراحة في الباقة." },
  { title: "SEO", team: "ننفذ On-page وTechnical وOff-page كعملية عمل متصلة.", client: "يعتمد المحتوى ويوفر المعلومات أو الوصول عند الحاجة.", boundary: "لا يضمن السيو ترتيبًا ولا مبيعات. الباقة تحدد حجم الإنتاج والمتابعة والتنفيذ الخارجي." },
  { title: "مرئيات وريلز وصوت", team: "نصمم ونمنتج النسخ المناسبة للصفحة وللريلز، وندير جودة النشر.", client: "يوفر المواد الخام أو يوافق على النسخ المنجزة.", boundary: "عدد التصميمات والريلز وجولات التعديل وحقوق المواد تُحدد في الباقة قبل البدء." },
  { title: "إحصاءات ومتابعة", team: "نعرض بيانات فعلية من مصادرها ونحدد ما يحتاج تحسينًا في الجولة التالية.", client: "يقرأ الأرقام ويقرر أولوياته التجارية وعروضه ودعواته للتواصل.", boundary: "نعرض ما تلتقطه أنظمة القياس فعلًا. لا نضمن نتيجة تجارية لا نتحكم في كل أسبابها." },
] as const;

const partnerPages = ["الرئيسية", "من نحن", "خدماتنا", "ألبوم أعمالنا", "الأسئلة الشائعة", "تواصل معنا", "مقالاتي", "احجز", "آراء العملاء"] as const;

export default function SalesCatalogPage() {
  return (
    <DocLayout
      parentHref="/playbook/sales"
      parentLabel="قسم المبيعات"
      title="الخدمات وحدود الباقة"
      description="خمس خدمات: ما ينفّذه الفريق، وما يقرّره الشريك، وأين يقف حدّ الباقة."
    >
    <section className="mt-8 scroll-mt-6" id="catalog">
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {serviceCatalog.map((service) => (
          <article key={service.title} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-2 border-b pb-2.5">
              <h3 className="text-[15px] font-bold">{service.title}</h3>
            </div>
            <dl className="mt-3 space-y-2.5 text-[13.5px]">
              <div className="flex gap-2.5">
                <dt className="w-24 shrink-0 font-bold text-primary">فريق مدونتي</dt>
                <dd className="leading-6 text-muted-foreground">{service.team}</dd>
              </div>
              <div className="flex gap-2.5">
                <dt className="w-24 shrink-0 font-bold text-amber-700 dark:text-amber-300">الشريك</dt>
                <dd className="leading-6 text-muted-foreground">{service.client}</dd>
              </div>
              <div className="flex gap-2.5 rounded-md bg-muted/50 p-2.5">
                <dt className="w-[86px] shrink-0 font-bold">حد الباقة</dt>
                <dd className="leading-6 text-muted-foreground">{service.boundary}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <p className="mt-3 rounded-lg border border-dashed p-3 text-[13px] leading-6 text-muted-foreground">
        لا أرقام هنا عن قصد. الأسعار وعدد المقالات والريلز وظهور كل باقة تتغير، فاقرأها من مصدرها الحيّ ولا تنقلها من الذاكرة.
      </p>
    </section>

    <section className="mt-8 scroll-mt-6" id="page">
      <SectionHead title="ماذا يأخذ الشريك بالضبط؟" hint="صفحة رسمية داخل مدونتي بتسع صفحات داخلية، يضبط شكلها بنفسه من الكونسول." />
      <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-lg border bg-card p-4">
          <h3 className="text-[15px] font-bold">صفحات الشريك</h3>
          <p className="mt-2 text-[13.5px] leading-7 text-muted-foreground">
            هذه هي الصفحات التي يراها الزائر داخل صفحة الشريك. الشريك يطفئ ما لا يريده من شاشة «موقعي» في الكونسول.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {partnerPages.map((page) => (
              <span key={page} className="rounded-md border bg-muted/40 px-2.5 py-1 text-[12.5px] font-semibold">{page}</span>
            ))}
          </div>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <h3 className="text-[15px] font-bold">ما يقرره الشريك</h3>
          <ul className="mt-2 list-disc space-y-1.5 pr-4 text-[13.5px] leading-7 text-muted-foreground marker:text-foreground/40">
            <li>اللون الأساسي للصفحة.</li>
            <li>شكل الشريط العلوي والذيل.</li>
            <li>أي الأقسام يظهر وأيها يُطفأ.</li>
            <li>اعتماد كل ما يُنشر باسمه.</li>
          </ul>
        </article>
      </div>
    </section>

    </DocLayout>
  );
}
