import { CheckCircle2, XCircle } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";
import { oneTest, rules, situations, words } from "./helpers/persona";

export default function PersonaPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="كيف نتكلّم باسم مدونتي"
      description="اقرأها قبل أي رسالة أو مكالمة أو إعلان. صفحة واحدة: ثلاث قواعد، ومواقف جاهزة، وكلمات ممنوعة."
    >
      <section className="rounded-lg border border-primary/30 bg-primary/[0.05] p-5">
        <p className="text-[15px] font-bold leading-8">
          نحن زميل خبير، لا بائع. نشرح بلا تعالٍ، ولا نَعِد بشيء لا نقدر نثبته.
        </p>
        <p className="mt-2 text-[13.5px] leading-7 text-muted-foreground">{oneTest}</p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">ثلاث قواعد</h2>
        <div className="mt-3 space-y-2.5">
          {rules.map((r, i) => (
            <article key={r.rule} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-[12px] font-bold text-primary">{i + 1}</span>
                <h3 className="text-[14.5px] font-bold">{r.rule}</h3>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                <p className="flex gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/[0.06] p-3 text-[13px] leading-6">
                  <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {r.right}
                </p>
                <p className="flex gap-1.5 rounded-md border border-rose-500/25 bg-rose-500/[0.05] p-3 text-[13px] leading-6 text-muted-foreground">
                  <XCircle className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-500" />
                  {r.wrong}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">ستّة مواقف تتكرّر</h2>
        <p className="mt-1 text-[13px] leading-6 text-muted-foreground">خذ الجملة الجاهزة وعدّل عليها باسم شريكك.</p>
        <div className="mt-3 space-y-2.5">
          {situations.map((s) => (
            <article key={s.when} className="rounded-lg border bg-card p-4">
              <h3 className="text-[14px] font-bold">{s.when}</h3>
              <p className="mt-2.5 flex gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/[0.06] p-3 text-[13px] leading-6">
                <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                {s.say}
              </p>
              <p className="mt-1.5 flex gap-1.5 rounded-md border border-rose-500/25 bg-rose-500/[0.05] p-3 text-[13px] leading-6 text-muted-foreground">
                <XCircle className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-500" />
                {s.dont}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
          <h2 className="text-[15px] font-bold">كلمات نستعملها</h2>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {words.use.map((w) => (
              <span key={w} className="rounded-md border bg-background/70 px-2.5 py-1 text-[13px] font-semibold">{w}</span>
            ))}
          </div>
        </article>
        <article className="rounded-lg border border-rose-500/25 bg-rose-500/[0.05] p-4">
          <h2 className="text-[15px] font-bold">كلمات ممنوعة</h2>
          <div className="mt-2.5 space-y-2">
            {words.avoid.map((w) => (
              <p key={w.word} className="text-[13px] leading-6 text-muted-foreground">
                <b className="text-foreground">{w.word}</b> — {w.why}
              </p>
            ))}
          </div>
        </article>
      </section>
    </DocLayout>
  );
}
