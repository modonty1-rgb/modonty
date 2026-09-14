import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";
import { DeptProhibitions } from "../components/dept-prohibitions";
import { DeptJobDescriptions } from "../components/dept-job-descriptions";
import { DeptRoles } from "../components/dept-roles";

/** صفحة القسم: مدخل واحد لكل ما يخصّه، وأي صفحة جديدة تُضاف هنا لا في جذر الـPlaybook. */
const pages = [
  { href: "/playbook/design/brand", title: "الهوية البصرية", line: "ثمانية ألوان بمواضع استعمالها، وخطّان، وقواعد اللوقو." },
  { href: "/playbook/design/media", title: "مقاسات الوسائط", line: "مقاسات الصور والفيديو والمنطقة الآمنة من القصّ." },
] as const;

export default function DesignSectionPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="قسم التصميم"
      description="الشكل الذي يعرفنا به الناس: اللون والخطّ واللوقو ومقاسات ما نصنعه."
    >
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4 text-[13.5px] leading-7">
        ارفع المقاس الصحيح من مصدر مرخّص، والباقي يتولّاه النظام: الضغط والنسخ والبديل الضبابي.
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
      <DeptJobDescriptions deptKey="design" />

      <DeptRoles deptKey="design" />

      <DeptProhibitions deptKey="design" />

    </DocLayout>
  );
}
