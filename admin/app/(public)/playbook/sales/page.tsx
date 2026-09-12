import Link from "next/link";
import { ArrowLeft, Award, LayoutPanelTop, Megaphone, Target } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";

/**
 * قسم المبيعات — مساحة واحدة يجتمع فيها كل ما يخصّ البيع (خالد، ١١ سبتمبر ٢٠٢٦).
 * كانت صفحاته متفرّقة في جذر الـPlaybook، فصار المندوب يبحث عنها واحدةً واحدة.
 * أي مادة بيع جديدة تُضاف هنا لا في الجذر.
 */
const pages = [
  {
    href: "/playbook/sales/who-we-serve",
    title: "من نخدم",
    line: "شرائح العملاء وترتيبها بسهولة الإغلاق، ونقاط ألم كل شريحة.",
    icon: Target,
  },
  {
    href: "/playbook/sales/what-we-sell",
    title: "ما يحصل عليه العميل",
    line: "الباقة، ورحلته عبر الأسطح، والأدوات التي يستعملها في الكونسول.",
    icon: LayoutPanelTop,
  },
  {
    href: "/playbook/sales/scripts",
    title: "السكربتات والاعتراضات",
    line: "افتتاح المكالمة، وأسئلة الاكتشاف، والردّ على الاعتراضات، وجمل الإغلاق.",
    icon: Megaphone,
  },
  {
    href: "/playbook/sales/golden-rules",
    title: "القواعد الذهبية",
    line: "الجمل التي تحسم المقارنة مع البدائل، وما لا يُقال أبدًا.",
    icon: Award,
  },
  {
    href: "/playbook/sales/compare",
    title: "فيمَ نختلف",
    line: "ست مقارنات مع البدائل، وجدول الفرق، وثلاث حالات لا نناسبها.",
    icon: Award,
  },
  {
    href: "/playbook/sales/catalog",
    title: "الخدمات وحدود الباقة",
    line: "الخدمات الخمس وأين يقف حدّ كل واحدة، وصفحة الشريك وما يقرّره فيها.",
    icon: LayoutPanelTop,
  },
] as const;

const rules = [
  "لا تَعِد بترتيب في محركات البحث ولا بعدد عملاء.",
  "كل رقم تقوله للعميل من مصدره الحيّ، لا من ذاكرتك.",
  "حدود الباقة تُقال قبل التوقيع لا بعده.",
  "«لسنا الأنسب لك» جملة مسموحة، وتكسبنا أكثر مما تخسر.",
] as const;

export default function SalesSectionPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="قسم المبيعات"
      description="كل ما يحتاجه من يقابل العميل: مَن نخدم، وماذا نبيع، وكيف نردّ، وأين نتوقّف."
    >
      {/*
        نُقلت من «ما هي مدونتي؟» (خالد، ١٢ سبتمبر ٢٠٢٦): سكربت بيع لا تعريفَ منظومة،
        وصفحة التعريف تشرح ما هي مدونتي لا ما يُقال في المكالمة.
      */}
      <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
        <h2 className="text-[15px] font-bold">الجملة التي تقولها للشريك</h2>
        <p className="mt-2 text-[13.5px] leading-7 text-muted-foreground">
          «نحوّل خبرتك إلى محتوى يجد الناس فيه إجابتهم، وننشره باسمك على منصة موثّقة يزورها جمهور
          يبحث فعلًا. تأخذ صفحة رسمية بخدماتك وأعمالك وآراء عملائك، ونحن ننتج ونراجع، وأنت تعتمد
          وتتابع أرقامك الحقيقية.»
        </p>
      </section>

      <section className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4">
        <h2 className="text-[15px] font-bold">أربع قواعد قبل أي مكالمة</h2>
        <ul className="mt-2.5 list-disc space-y-1.5 ps-5 text-[13.5px] leading-7 text-muted-foreground marker:text-amber-600/70">
          {rules.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">صفحات القسم</h2>
        <div className="mt-3 grid gap-2.5 md:grid-cols-2">
          {pages.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex items-start justify-between gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <p.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[14.5px] font-bold">{p.title}</p>
                  <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">{p.line}</p>
                </div>
              </div>
              <ArrowLeft className="mt-1 h-4 w-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>
    </DocLayout>
  );
}
