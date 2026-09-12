import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ImageIcon,
  MapPin,
  Send,
  UsersRound,
} from "lucide-react";

import { PlaybookFlow } from "@/app/(public)/playbook/components/playbook-flow";
import { SectionHead } from "@/app/(public)/playbook/components/section-head";

const editableGroups = [
  {
    title: "هوية النشاط والسجلات",
    body: "اسم النشاط، الاسم القانوني والبديل، تاريخ التأسيس، الشعار المختصر والوصف، رقم السجل التجاري، والرقم الضريبي أو ضريبة القيمة المضافة بحسب البلد.",
  },
  {
    title: "الموقع الفعلي",
    body: "المدينة، المنطقة، الحي، الشارع، رقم المبنى، الرقم الإضافي في السعودية، والرمز البريدي.",
  },
  {
    title: "ساعات العمل",
    body: "وقت الفتح والإغلاق وأيام العمل. اليوم غير المحدد يظهر للزائر على أنه مغلق.",
  },
] as const;

const verifiedByModonty = [
  "البريد المعرّف للحساب ورابط النشاط",
  "روابط الشبكات الاجتماعية والتصنيف",
  "نوع المنظمة والشكل القانوني",
  "الهاتف ونوع التواصل وبلد العنوان",
] as const;

/**
 * صفحة الـPlaybook الرئيسية = التشغيل وحده.
 * كل ما يوصّف مدونتي نفسها — تعريفها وفلسفتها وهويتها وتموضعها — مكانه «ما هي مدونتي؟»
 * (قرار خالد، ١١ سبتمبر ٢٠٢٦)، فلا تُضاف هنا مادة تعريفية مهما بدت مناسبة.
 */
export default function ClientSetupPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-6" dir="rtl">
      <header id="overview" className="scroll-mt-6 rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-primary/25 bg-primary/5 px-2.5 py-1 font-mono text-[12px] font-bold tracking-[0.18em] text-primary">PLAYBOOK</span>
          <span className="text-[12px] font-semibold text-muted-foreground">دليل التشغيل</span>
        </div>
        <h1 className="mt-4 text-xl font-bold">كيف يبدأ الشريك معنا؟</h1>
        <p className="mt-2 max-w-4xl text-sm leading-7 text-muted-foreground">
          هذه الصفحة للتشغيل: من يستلم، وما الذي يجمعه، وما الذي يسلّمه. أما تعريف مدونتي وفلسفتها وهويتها وفيمَ تختلف،
          فكلها في <a href="/playbook" className="font-semibold text-primary hover:underline">«ما هي مدونتي؟»</a> — اقرأها أولًا إن كنت جديدًا.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
          <span className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 font-semibold">
            <UsersRound className="h-3.5 w-3.5 text-primary" />
            مالك هذه المرحلة: متابعة العملاء
          </span>
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
            لا يبدأ الإنتاج قبل اكتمال الملف
          </span>
        </div>
      </header>

      <section id="workflow" className="mt-8 scroll-mt-6">
        <SectionHead title="مسار التأسيس: من التوقيع إلى جاهزية الشريك" hint="كل خطوة لها مالك ومخرج واضح. لا تنتقل مهمة إلى المحتوى أو التصميم قبل اكتمال ما قبلها." />
        <div className="mt-4 overflow-hidden rounded-lg border bg-card">
          <PlaybookFlow />
        </div>
      </section>

      <section id="client-data" className="mt-8 scroll-mt-6">
        <SectionHead title="ما الذي يدخله الشريك، وما الذي نوثّقه نحن؟" hint="حقول يملكها الشريك في الكونسول، وحقول تبقى موثّقة عندنا يقرأها ولا يعدّلها." />
        <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2.5 border-b pb-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"><Building2 className="h-4 w-4" /></span>
              <h3 className="text-[15px] font-bold">يدخله الشريك من الكونسول</h3>
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              {editableGroups.map((group) => (
                <div key={group.title} className="rounded-md border bg-muted/30 p-3">
                  <h4 className="text-[13.5px] font-bold">{group.title}</h4>
                  <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">{group.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 rounded-md bg-amber-500/10 p-2.5 text-[12.5px] leading-6 text-amber-900 dark:text-amber-200">
              <ImageIcon className="mt-1 h-3.5 w-3.5 shrink-0" />
              <span><b>مواد الهوية:</b> الشعار وصور الغلاف والألبوم تُجمع مرة واحدة ضمن أصول النشاط، فلا تُطلب من جديد مع كل تصميم أو مقال.</span>
            </p>
          </article>

          <article id="verified" className="scroll-mt-6 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2.5 border-b pb-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><BadgeCheck className="h-4 w-4" /></span>
              <h3 className="text-[15px] font-bold">يبقى موثّقًا لدى مدونتي</h3>
            </div>
            <ul className="mt-3 space-y-2 text-[13.5px] leading-7 text-muted-foreground">
              {verifiedByModonty.map((item) => (
                <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{item}</li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-2 rounded-md border border-primary/15 bg-primary/[0.05] p-2.5 text-[12.5px] leading-6">
              <MapPin className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
              الشريك يؤكد الحقيقة التي تخصه، ومدونتي تحافظ على اتساقها بين الكونسول والصفحة العامة. التعديل يمر عبر متابعة العملاء.
            </p>
          </article>
        </div>
      </section>

      <section id="handoff" className="mt-8 scroll-mt-6">
        <SectionHead title="التسليم التالي" hint="ما الذي يحدث بعد اكتمال ملف الشريك." />
        <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-dashed bg-muted/20 p-4 text-[13.5px] leading-7 text-muted-foreground">
          <Send className="mt-1 h-4 w-4 shrink-0 text-primary" />
          <span>
            تنتقل المهمة إلى خطة المحتوى: الجمهور، والهدف، ونبرة الكلام، والخدمات، والأسئلة الشائعة، والمنافسون، والادعاءات الممنوعة،
            وملف نشاطه على خرائط Google عند وجوده. تُبنى هذه المرحلة هنا بعد اعتماد شكل الدليل.
          </span>
        </p>
      </section>
    </div>
  );
}
