import { CheckCircle2, Sparkles, Wand2, XCircle } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";
import { autoHandled, fieldRules, journey, qualityBoosters } from "./helpers/data";

export default function ArticleJourneyPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="رحلة المقال: من الفكرة إلى النشر"
      description="ثلاث مراحل، وحدود حقول يفرضها النظام عند الحفظ لا عند التحذير. اقرأها مرّة، وارجع إليها عند الشكّ."
    >
      <section>
        <h2 className="text-[16px] font-bold">المراحل الثلاث</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {journey.map((phase) => (
            <article key={phase.number} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 border-b pb-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-[12px] font-bold text-primary">{phase.number}</span>
                <h3 className="text-[15px] font-bold">{phase.phase}</h3>
              </div>
              <p className="mt-2.5 text-[13px] leading-6 text-muted-foreground">{phase.description}</p>
              <div className="mt-3 space-y-2.5">
                {phase.tabs.map((tab) => (
                  <div key={tab.tab} className="rounded-md border bg-muted/25 p-3">
                    <p className="text-[13.5px] font-bold">{tab.tab}</p>
                    <ul className="mt-1.5 list-disc space-y-1 ps-4 text-[12.5px] leading-6 text-muted-foreground marker:text-foreground/40">
                      {tab.fields.map((field) => <li key={field}>{field}</li>)}
                    </ul>
                    <p className="mt-2 border-t pt-1.5 text-[12px] leading-6 text-foreground/75">{tab.note}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">حدود الحقول: افعل ولا تفعل</h2>
        <p className="mt-1 text-[13px] leading-6 text-muted-foreground">تجاوز هذه الحدود رفضٌ عند الحفظ، لا تحذير.</p>
        <div className="mt-3 space-y-3">
          {fieldRules.map((group) => (
            <article key={group.step} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 border-b pb-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-md border bg-muted text-[12px] font-bold">{group.step}</span>
                <h3 className="text-[15px] font-bold">{group.title}</h3>
              </div>
              <div className="mt-3 grid gap-2.5 lg:grid-cols-3">
                {group.rules.map((rule) => (
                  <div key={rule.label} className="rounded-md border bg-muted/25 p-3">
                    <p className="text-[13.5px] font-bold">{rule.label}</p>
                    <p className="mt-1.5 flex gap-1.5 text-[12.5px] leading-6 text-muted-foreground">
                      <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      {rule.do}
                    </p>
                    <p className="mt-1.5 flex gap-1.5 text-[12.5px] leading-6 text-muted-foreground">
                      <XCircle className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-500" />
                      {rule.dont}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-lg border bg-card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold">
            <Wand2 className="h-4 w-4 text-primary" />
            يتولّاه النظام — لا تتدخّل
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 ps-5 text-[13px] leading-7 text-muted-foreground marker:text-foreground/40">
            {autoHandled.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>

        <article className="rounded-lg border bg-card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold">
            <Sparkles className="h-4 w-4 text-primary" />
            معزّزات الجودة
          </h2>
          <p className="mt-2 text-[12.5px] leading-6 text-muted-foreground">ليست شرطًا للنشر، لكنها الفرق بين مقال يمرّ ومقال يُوثَق به.</p>
          <div className="mt-2.5 space-y-1.5">
            {qualityBoosters.map(([title, note]) => (
              <p key={title} className="text-[12.5px] leading-6 text-muted-foreground">
                <b className="text-foreground">{title}:</b> {note}
              </p>
            ))}
          </div>
        </article>
      </section>
    </DocLayout>
  );
}
