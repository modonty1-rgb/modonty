import { Briefcase, FolderTree, HelpCircle, Tag, XCircle } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";

/**
 * تنظيم المحتوى — نُقل من `guidelines/organization` وحُذفت الصفحة هناك.
 * السبب: الفئة والوسم والقطاع تحدّد كيف يكتشف الزائر المحتوى وكيف تفهم محركات البحث تخصّص
 * الشريك، فهي بنية المنصّة لا خطوة إنتاج.
 */
const ways = [
  {
    icon: FolderTree,
    name: "الفئة (Category)",
    tone: "border-sky-500/35 bg-sky-500/[0.06]",
    when: "موضوع عريض ينتمي له المقال.",
    example: "التقنية · التسويق · الصحة",
    rule: "كل مقال فئة واحدة فقط، وعدد الفئات بين ٥ و١٥ لا أكثر.",
  },
  {
    icon: Tag,
    name: "الوسم (Tag)",
    tone: "border-violet-500/35 bg-violet-500/[0.06]",
    when: "كلمة محدّدة تربط مقالات متشابهة.",
    example: "سيو · تصميم واجهات · أدوات مجانية",
    rule: "كل مقال من ٣ إلى ٥ وسوم، محدّدة لا عامّة.",
  },
  {
    icon: Briefcase,
    name: "القطاع (Industry)",
    tone: "border-emerald-500/35 bg-emerald-500/[0.06]",
    when: "نوع نشاط الشريك — للشركاء لا للمقالات.",
    example: "الرعاية الصحية · التعليم · العقارات",
    rule: "كل شريك قطاع واحد، وعدد القطاعات بين ١٠ و٢٠ كحدّ أقصى.",
  },
] as const;

const decisionTree = [
  ["موضوع عريض: التقنية، التسويق، الصحة؟", "فئة"],
  ["كلمة محدّدة: سيو، تصميم واجهات، تحليلات؟", "وسم"],
  ["نوع نشاط الشريك: مستشفى، مدرسة، متجر؟", "قطاع"],
] as const;

const mistakes = [
  {
    wrong: "وسم اسمه «مقالات»",
    why: "كل المحتوى مقالات أصلًا، فالوسم بلا فائدة.",
    fix: "احذفه واستعمل وسمًا محدّدًا مثل «دليل خطوة بخطوة».",
  },
  {
    wrong: "نفس الاسم فئةً ووسمًا",
    why: "تكرار يشتّت محركات البحث ويربك الزائر.",
    fix: "اختر واحدًا: الفئة للتصنيف الرئيسي، والوسم للربط.",
  },
  {
    wrong: "فئة فيها مقال واحد",
    why: "الفئة شبه الفارغة إشارة جودة سلبية.",
    fix: "ادمجها مع فئة قريبة، أو احذفها إن لم تكن عندك خطة محتوى لها.",
  },
] as const;

export default function ContentStructurePage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="تنظيم المحتوى: الفئة والوسم والقطاع"
      description="ثلاث طرق تنظيم، لكل واحدة عملها. الخلط بينها يشتّت الزائر ومحرك البحث معًا."
    >
      <section className="grid gap-3 lg:grid-cols-3">
        {ways.map((way) => {
          const Icon = way.icon;
          return (
            <article key={way.name} className={`rounded-lg border p-4 ${way.tone}`}>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-background/70 text-primary"><Icon className="h-3.5 w-3.5" /></span>
                <h2 className="text-[15px] font-bold">{way.name}</h2>
              </div>
              <p className="mt-2.5 text-[13.5px] leading-7 text-muted-foreground">{way.when}</p>
              <p className="mt-2 text-[13px] font-semibold">{way.example}</p>
              <p className="mt-2.5 border-t pt-2 text-[12.5px] leading-6 text-muted-foreground">{way.rule}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">
          <HelpCircle className="h-4 w-4 text-primary" />
          حيران؟ اسأل نفسك سؤالًا واحدًا
        </h2>
        <div className="mt-3 space-y-2">
          {decisionTree.map(([question, answer]) => (
            <div key={question} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/25 p-3">
              <p className="text-[13.5px] leading-6">{question}</p>
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[13px] font-bold text-primary">{answer}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-rose-500/30 bg-rose-500/[0.05] p-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">
          <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          ثلاثة أخطاء متكرّرة
        </h2>
        <div className="mt-3 grid gap-2.5 lg:grid-cols-3">
          {mistakes.map((m) => (
            <div key={m.wrong} className="rounded-md border bg-background/60 p-3">
              <p className="text-[13.5px] font-bold">{m.wrong}</p>
              <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">{m.why}</p>
              <p className="mt-1.5 text-[12.5px] leading-6 text-foreground/80"><b>الصواب:</b> {m.fix}</p>
            </div>
          ))}
        </div>
      </section>
    </DocLayout>
  );
}
