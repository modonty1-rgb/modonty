import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";
import { DeptProhibitions } from "../components/dept-prohibitions";
import { DeptJobDescriptions } from "../components/dept-job-descriptions";
import { DeptRoles } from "../components/dept-roles";
import { DeptVoice } from "../components/dept-voice";

/** صفحة القسم: مدخل واحد لكل ما يخصّه، وأي صفحة جديدة تُضاف هنا لا في جذر الـPlaybook. */
const pages = [
  { href: "/playbook/content/briefs", title: "البريف", line: "من أين تجيء فكرة المقال، وما الذي نسأله الشريك." },
  { href: "/playbook/content/structure", title: "تنظيم المحتوى", line: "الفئة والوسم والقطاع، ومتى تستعمل كلًّا منها." },
  { href: "/playbook/content/article-journey", title: "رحلة المقال", line: "ثلاث مراحل، وحدود حقول يرفضها النظام عند تجاوزها." },
  { href: "/playbook/content/authority", title: "السلطة والنسبة", line: "باسم مَن يُنشر المقال، وكيف تُبنى ثقة الاسم." },
  { href: "/playbook/content/reels", title: "الريلز", line: "تأتي من الشريك، ونضبط بياناتها وسيوها قبل النشر." },
  { href: "/playbook/content/after-publish", title: "بعد النشر", line: "صحّة المقال، ومَن يملك أي حقل: أنت أم النظام." },
] as const;

export default function ContentSectionPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="قسم المحتوى"
      description="من فكرة المقال إلى ما بعد نشره: البريف، والتنظيم، والكتابة، والنسبة، والريلز، والمتابعة."
    >
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4 text-[13.5px] leading-7">
        الأرقام هنا يفرضها النظام عند الحفظ، لا اجتهاد كاتب. إن خالفك النظام فالصفحة هي الخطأ، بلّغ عنها.
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
      <DeptJobDescriptions deptKey="content" />

      <DeptVoice deptKey="content" />


      <DeptRoles deptKey="content" />

      <DeptProhibitions deptKey="content" />

    </DocLayout>
  );
}
