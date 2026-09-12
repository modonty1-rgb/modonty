import {
  BellRing,
  Boxes,
  Database,
  FileSearch,
  Globe,
  Image as ImageIcon,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";
import { SectionHead } from "../components/section-head";

/**
 * الوجه التقني للمنظومة، مكتوبًا لغير التقني.
 * كل بند هنا مقابله مجلّد أو ملف قائم في المستودع — لا ميزة تُذكر قبل أن تُقاس في الكود.
 */
const apps = [
  { name: "modonty", host: "modonty.com", job: "الموقع العام: الفيد والمقالات والصناعات وصفحات الشركاء والريلز والصوت والبحث." },
  { name: "pay", host: "pay.modonty.com", job: "بوابة الشراء: الباقات والطلب والدفع والفاتورة، تُخدَم من تطبيق مدونتي نفسه." },
  { name: "console", host: "console.modonty.com", job: "مساحة الشريك: بياناته وأصوله وشكل صفحته واعتماده وإحصاءاته." },
  { name: "admin", host: "admin.modonty.com", job: "تشغيل الفريق: الإنتاج والمراجعة والاعتماد وإدارة الشركاء والجودة." },
  { name: "shared", host: "—", job: "المشترك: مخطط قاعدة البيانات، والمكوّنات، ومنطق الوسائط والسيو الذي تستهلكه التطبيقات الثلاثة." },
] as const;

const capabilities = [
  {
    icon: FileSearch,
    title: "السيو التقني يُبنى آليًا",
    body: "العنوان والوصف والرابط المعياري والبيانات المنظمة وخريطة الموقع وملف الروبوتس تُولَّد وتُفحص من المنظومة، لا تُكتب يدويًا في كل مقال.",
    where: "admin/lib/seo",
  },
  {
    icon: ShieldCheck,
    title: "بوابة تمنع النشر الناقص",
    body: "المقال لا يخرج قبل أن يجتاز فحوصًا على المحتوى والوسائط والبيانات المنظمة. الرفض هنا يحمي الشريك من صفحة تضرّه في البحث.",
    where: "admin/lib/seo/assert-article-publishable.ts",
  },
  {
    icon: Radar,
    title: "متابعة الفهرسة من مصدرها",
    body: "نقرأ بيانات أداة مالكي المواقع من Google، ونقيس سرعة الصفحات، ونرسل الروابط الجديدة إلى IndexNow لتنبيه قنوات مدعومة مثل Bing.",
    where: "admin/lib/gsc · admin/lib/indexnow.ts · admin/lib/bing-webmaster",
  },
  {
    icon: ImageIcon,
    title: "الصور تُعالَج لا تُرفع فقط",
    body: "تُضغط وتُحفظ بأبعادها الفعلية، ولها نصّ بديل ووصف واسم ملف، وتُحدَّث بياناتها في المقال والبيانات المنظمة عند أي تغيير.",
    where: "admin/lib/media · admin/lib/seo-images · admin/lib/compress-image.ts",
  },
  {
    icon: BellRing,
    title: "تنبيهات لحظية للفريق",
    body: "الأحداث المهمّة تصل إلى قناة تيليجرام لحظة وقوعها، فلا ينتظر أحد فتح اللوحة ليعرف أن شيئًا حدث.",
    where: "admin/lib/notifications",
  },
  {
    icon: Sparkles,
    title: "الذكاء الاصطناعي مساعد لا بديل",
    body: "يُستعمل في التوليد الأولي وفحص الجودة، ثم يمرّ كل شيء على بشر ثم على اعتماد الشريك. لا يُنشر نصّ آليّ كما هو.",
    where: "admin/lib/ai · admin/lib/openai-article-generator.ts",
  },
  {
    icon: Globe,
    title: "قناة اختيارية لموقع الشريك",
    body: "إن كان للشريك موقعه الخاص، يسحب مقالاته من مدونتي عبر واجهة برمجية بحسب باقته وإذنه. إضافة لا أساس.",
    where: "console/app/api/v1",
  },
] as const;

export default function PlaybookTechPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="الجانب التقني"
      description="ما الذي تفعله المنظومة تقنيًا، ولماذا يهمّ غير التقني. اقرأه قبل أن تعد العميل بشيء تقني، وقبل أن تشرح لماذا يتأخر النشر."
    >
      <section id="apps" className="scroll-mt-6">
        <SectionHead title="خمسة مشاريع في مستودع واحد" hint="لكل تطبيق جمهوره، وكلها تقرأ من قاعدة بيانات واحدة." />
        <div className="mt-4 overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-[13.5px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 font-bold">المشروع</th>
                  <th className="px-4 py-3 font-bold">العنوان</th>
                  <th className="px-4 py-3 font-bold">عمله</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.name} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-[12.5px] font-bold" dir="ltr">{app.name}</td>
                    <td className="px-4 py-3 font-mono text-[12.5px] text-muted-foreground" dir="ltr">{app.host}</td>
                    <td className="px-4 py-3 leading-6 text-muted-foreground">{app.job}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-dashed p-3 text-[13px] leading-6 text-muted-foreground">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>قاعدة البيانات واحدة يشترك فيها الجميع، ومخططها في <span className="font-mono text-[12px]" dir="ltr">shared/prisma</span>. لهذا يظهر تعديل الشريك في الكونسول على صفحته العامة بلا نقل يدوي.</span>
        </p>
      </section>

      <section id="capabilities" className="mt-8 scroll-mt-6">
        <SectionHead title="ماذا تفعل المنظومة بلا أن يطلبه أحد" hint="هذه هي الأعمال التي تختفي من على كاهل الشريك، وهي ما يفرّقنا عن أداة يشتريها ويشغّلها بنفسه." />
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-3.5 w-3.5" /></span>
                    <h3 className="text-[15px] font-bold">{item.title}</h3>
                  </div>
                </div>
                <p className="mt-2.5 text-[13.5px] leading-7 text-muted-foreground">{item.body}</p>
                <p className="mt-2.5 border-t pt-2 font-mono text-[11.5px] text-muted-foreground" dir="ltr">{item.where}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="limits" className="mt-8 scroll-mt-6">
        <SectionHead title="ما لا تفعله التقنية" hint="اقرأه قبل أي وعد. هذه حدود المنظومة لا نواقص مؤقتة." />
        <ul className="mt-4 list-disc space-y-2 rounded-lg border border-rose-500/30 bg-rose-500/[0.05] p-4 pe-4 ps-8 text-[13.5px] leading-7 text-muted-foreground marker:text-rose-500/70">
          <li>لا تصنع ترتيبًا في Google. تجعل الصفحة صالحة للفهرسة والفهم، والترتيب قرار محرك البحث.</li>
          <li>لا تعوّض خدمة ضعيفة أو عرضًا غير مناسب.</li>
          <li>لا تنشر على موقع الشريك إلا بإذن وباقة تتيح ذلك.</li>
          <li>لا تقيس ما لا تلتقطه أنظمة القياس. غياب الرقم يُقال كما هو، لا يُملأ بتقدير.</li>
        </ul>
      </section>

      <section id="pages" className="mt-8 scroll-mt-6">
        <SectionHead title="التفاصيل التقنية، صفحة لكل موضوع" hint="اقرأ الصفحة التي تخص عملك اليوم، لا الخمس دفعة واحدة." />
        <div className="mt-4 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {[
            { href: "/playbook/tech/publishing", title: "بوّابة النشر", line: "الشروط التي توقف خروج المقال." },
            { href: "/playbook/tech/seo-score", title: "نتيجة السيو", line: "من أين يأتي الرقم، وكيف يرتفع." },
            { href: "/playbook/tech/image-seo", title: "سيو الصور", line: "النص البديل والوصف واسم الملف." },
            { href: "/playbook/tech/search-preview", title: "شكل المقال في البحث", line: "معاينة جوجل وواتساب قبل النشر." },
            { href: "/playbook/tech/client-articles", title: "مقالات الشركاء", line: "ما يُسحب إلى موقع الشريك ومتى." },
          ].map((item) => (
            <a key={item.href} href={item.href} className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]">
              <p className="text-[14px] font-bold">{item.title}</p>
              <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">{item.line}</p>
            </a>
          ))}
        </div>
      </section>

      <p className="mt-8 flex items-start gap-2 rounded-lg border bg-card p-4 text-[13px] leading-7 text-muted-foreground">
        <Boxes className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          تفاصيل التنفيذ اليومي — مقاسات الصور، وحدود الحقول، ونتيجة السيو، وبوابة النشر — في{" "}
          <a href="/playbook" className="font-semibold text-primary hover:underline">دليل الفريق</a>. هذه الصفحة تشرح المنظومة، وذاك يشرح كيف تنفّذ داخلها.
        </span>
      </p>
    </DocLayout>
  );
}
