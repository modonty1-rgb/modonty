import { ShieldCheck } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";
import { authoritySteps, exceptions, modontyAuthorityPlan } from "./helpers/data";

export default function AuthorityPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="السلطة والنسبة: باسم مَن يُنشر المحتوى؟"
      description="مدونتي هي المؤلّف الافتراضي. الاستثناء يحتاج سببًا، وكل اسم يوقّع مقالًا يحتاج سندًا يفهمه محرّك البحث."
    >
      <section className="rounded-lg border border-primary/30 bg-primary/[0.05] p-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">
          <ShieldCheck className="h-4 w-4 text-primary" />
          القاعدة: مدونتي هي المؤلّف الافتراضي
        </h2>
        <p className="mt-2 text-[13.5px] leading-7 text-muted-foreground">
          الخبرة والموثوقية تُبنى على مستوى المنصّة لا الفرد. هذا قرار مقصود: الاسم الواحد المتراكم
          أقوى من عشرة أسماء متفرّقة، ولا يذهب الرصيد إن غادر كاتب.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">ثلاثة استثناءات فقط</h2>
        <div className="mt-3 grid gap-2.5 lg:grid-cols-3">
          {exceptions.map((item) => (
            <article key={item.title} className="rounded-lg border bg-card p-4">
              <h3 className="text-[14px] font-bold">{item.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">{item.description}</p>
              <p className="mt-2 border-t pt-2 text-[12.5px] leading-6 text-foreground/75">{item.example}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">بناء سلطة الكاتب، خطوة خطوة</h2>
        <div className="mt-3 space-y-3">
          {authoritySteps.map((step) => (
            <article key={step.number} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 border-b pb-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-[12px] font-bold text-primary">{step.number}</span>
                <h3 className="text-[15px] font-bold">{step.title}</h3>
              </div>
              <ul className="mt-3 list-disc space-y-1.5 ps-5 text-[13px] leading-7 text-muted-foreground marker:text-foreground/40">
                {step.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="mt-2.5 rounded-md bg-muted/40 p-2.5 text-[12.5px] leading-6 text-foreground/80">
                <b>لماذا:</b> {step.why}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">سلطة مدونتي نفسها: ثلاث مراحل</h2>
        <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
          ما يبني اسم المنصّة أمام محركات البحث، بالترتيب الذي يُنفَّذ به.
        </p>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {modontyAuthorityPlan.map((phase) => (
            <article key={phase.phase} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-2 border-b pb-2.5">
                <h3 className="text-[15px] font-bold">{phase.phase}</h3>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11.5px] font-semibold text-muted-foreground">{phase.when}</span>
              </div>
              <div className="mt-3 space-y-2.5">
                {phase.actions.map(([task, how]) => (
                  <div key={task} className="rounded-md border bg-muted/25 p-3">
                    <p className="text-[13px] font-bold">{task}</p>
                    <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">{how}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </DocLayout>
  );
}
