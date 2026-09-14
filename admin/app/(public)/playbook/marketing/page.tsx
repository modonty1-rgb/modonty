import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";
import { DeptProhibitions } from "../components/dept-prohibitions";
import { DeptJobDescriptions } from "../components/dept-job-descriptions";
import { SegmentsLink } from "../components/segments-link";
import { DeptRoles } from "../components/dept-roles";

/** صفحة القسم: مدخل واحد لكل ما يخصّه، وأي صفحة جديدة تُضاف هنا لا في جذر الـPlaybook. */
const pages = [
  { href: "/playbook/marketing/plan", title: "خطة التسويق", line: "الرسائل الخمس، والقنوات لكل سوق، ومؤشّرات الأعمال." },
  { href: "/playbook/marketing/measurement", title: "القياس", line: "ماذا نعرض للشريك، ومن أين جاء كل رقم." },
] as const;

export default function MarketingSectionPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="قسم التسويق"
      description="الرسائل والقنوات وما نقيسه. للميديا باير ومن يبني الحملة."
    >
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4 text-[13.5px] leading-7">
        لا رقم في إعلان بلا مصدر حيّ، ولا وعد بنتيجة لا نتحكّم في أسبابها.
      </p>

      <section>
        <h2 className="text-[16px] font-bold">صفحات القسم</h2>
        <div className="mt-3 grid gap-2.5 md:grid-cols-2">
          {pages.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex items-start justify-between gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
            >
              <div>
                <p className="text-[14.5px] font-bold">{p.title}</p>
                <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">{p.line}</p>
              </div>
              <ArrowLeft className="mt-1 h-4 w-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>
      <SegmentsLink />

      <DeptJobDescriptions deptKey="marketing" />

      <DeptRoles deptKey="marketing" />

      <DeptProhibitions deptKey="marketing" />

    </DocLayout>
  );
}
