import {
  ArrowLeftRight,
  Ban,
  BookMarked,
  CalendarClock,
  Gauge,
  ListChecks,
  Ruler,
  ShieldQuestion,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

import { JOB_DESCRIPTIONS, type JobDescription } from "../helpers/job-descriptions-data";

/**
 * الأوصاف الوظيفية داخل صفحة القسم.
 *
 * كان لها مسارها المستقلّ `/playbook/job-descriptions` ليوم واحد، فألغاه خالد
 * (١٢ سبتمبر ٢٠٢٦): «نشيل المعلومات اللي هنا ونحطها جوا قسم المبيعات … ويلغي لي
 * الصفحة هذي … أبغى أحطّ كل حاجة بقسمها». وهو امتداد لقاعدته المتكرّرة في هذا
 * الدليل: من يفتح قسمه يجد فيه كل ما يخصّه، ولا يقفز بين صفحتين ليعرف عمله.
 *
 * والمخفيّ (`hidden`) لا يُرسم هنا ولا في أي قائمة.
 */
function Block({
  icon: Icon,
  title,
  tone = "plain",
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone?: "plain" | "warn" | "stop";
  children: React.ReactNode;
}) {
  const skin =
    tone === "warn"
      ? "border-amber-500/30 bg-amber-500/[0.05]"
      : tone === "stop"
        ? "border-rose-500/25 bg-rose-500/[0.04]"
        : "border-border bg-background/60";
  const ink =
    tone === "warn"
      ? "text-amber-700 dark:text-amber-300"
      : tone === "stop"
        ? "text-rose-600 dark:text-rose-400"
        : "text-primary";

  return (
    <section className={`rounded-lg border p-4 ${skin}`}>
      <h4 className="flex items-center gap-2 text-[14px] font-bold">
        <Icon className={`h-4 w-4 ${ink}`} />
        {title}
      </h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Lines({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc space-y-1.5 ps-5 text-[13px] leading-7 text-muted-foreground marker:text-foreground/40">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function Job({ job }: { job: JobDescription }) {
  return (
    <article className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
        <span className="text-muted-foreground">
          الشاغل: <strong className="font-semibold text-foreground">{job.holder}</strong>
        </span>
        <span className="text-muted-foreground">
          يرفع إلى: <strong className="font-semibold text-foreground">{job.reportsTo}</strong>
        </span>
      </div>
      <h3 className="mt-2 text-[17px] font-bold">{job.title}</h3>
      <p className="mt-2 border-s-2 border-primary ps-3 text-[14px] font-bold leading-7">{job.purpose}</p>

      <div className="mt-4 space-y-3">
        <Block icon={ListChecks} title="خطوات العمل">
          <div className="space-y-4">
            {job.steps.map((g, gi) => (
              <div key={g.title}>
                <p className="flex items-center gap-2 text-[13px] font-bold">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[10px] text-primary">
                    {gi + 1}
                  </span>
                  {g.title}
                </p>
                <ol className="mt-2 space-y-1.5">
                  {g.items.map((t, i) => (
                    <li key={t} className="flex items-start gap-3 rounded-md border bg-card p-2.5">
                      <span className="mt-px w-6 shrink-0 text-end font-mono text-[11px] font-bold text-muted-foreground">
                        {gi + 1}.{i + 1}
                      </span>
                      <span className="text-[13px] leading-6">{t}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Block>

        <Block icon={CalendarClock} title="المخرجات وإيقاعها">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-right text-[13px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 font-bold">المخرَج</th>
                  <th className="px-3 py-2 font-bold">الإيقاع</th>
                </tr>
              </thead>
              <tbody>
                {job.outcomes.map((o) => (
                  <tr key={o.t} className="border-b last:border-0">
                    <th className="px-3 py-2.5 text-right font-semibold leading-6">{o.t}</th>
                    <td className="px-3 py-2.5 text-muted-foreground">{o.cadence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        <div className="grid gap-3 lg:grid-cols-2">
          <Block icon={Target} title="ما تقرّره وحدك">
            <Lines items={job.decides} />
          </Block>
          {job.escalates.length > 0 ? (
            <Block icon={ShieldQuestion} title="ما لا يُنفَّذ إلا باعتماد" tone="warn">
              <Lines items={job.escalates} />
            </Block>
          ) : null}
        </div>

        <Block icon={ArrowLeftRight} title="التسليم">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border bg-card p-3">
              <p className="text-[13px] font-bold">تستلم من</p>
              <div className="mt-2">
                <Lines items={job.receivesFrom} />
              </div>
            </div>
            <div className="rounded-md border bg-card p-3">
              <p className="text-[13px] font-bold">تسلّم إلى</p>
              <div className="mt-2">
                <Lines items={job.handsTo} />
              </div>
            </div>
          </div>
        </Block>

        <Block icon={Gauge} title="كيف تُقاس">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-right text-[13px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 font-bold">ما يُقاس</th>
                  <th className="px-3 py-2 font-bold">من أين يُقرأ</th>
                </tr>
              </thead>
              <tbody>
                {job.measures.map((m) => (
                  <tr key={m.t} className="border-b last:border-0">
                    <th className="px-3 py-2.5 text-right font-semibold leading-6">{m.t}</th>
                    <td className="px-3 py-2.5 leading-6 text-muted-foreground">{m.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        {job.standards ? (
          <Block icon={Ruler} title="معايير ملزمة" tone="warn">
            <Lines items={job.standards} />
          </Block>
        ) : null}

        <Block icon={Ban} title="ليس من هذه الوظيفة" tone="stop">
          <Lines items={job.notInRole} />
        </Block>

        <div className="grid gap-3 lg:grid-cols-2">
          <Block icon={Sparkles} title="ما تحتاجه لتشغلها">
            <Lines items={job.skills} />
          </Block>
          <Block icon={CalendarClock} title="أوّل ثلاثين يومًا">
            <ol className="list-decimal space-y-1.5 ps-5 text-[13px] leading-7 text-muted-foreground marker:font-bold marker:text-primary">
              {job.firstThirty.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </Block>
        </div>

        <Block icon={BookMarked} title="اقرأ هذه قبل أن تبدأ">
          <div className="flex flex-wrap gap-2">
            {job.reads.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-md border bg-card px-3 py-1.5 text-[12.5px] font-semibold transition-colors hover:border-primary/40 hover:text-primary"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </Block>
      </div>
    </article>
  );
}

export function DeptJobDescriptions({ deptKey }: { deptKey: string }) {
  const jobs = JOB_DESCRIPTIONS.filter((j) => j.deptKey === deptKey && !j.hidden);
  if (!jobs.length) return null;

  return (
    <section className="space-y-3" id="job-descriptions">
      <h2 className="text-[16px] font-bold">
        {jobs.length === 1 ? "الوصف الوظيفي" : `الأوصاف الوظيفية — ${jobs.length}`}
      </h2>
      {jobs.map((j) => (
        <Job key={j.slug} job={j} />
      ))}
    </section>
  );
}
