import { DUTIES, PEOPLE, ROLE_ASKS, STAGES } from "../helpers/roles-data";

/**
 * ما يخصّ قسمًا واحدًا من صفحة الأدوار: سؤال كل دور فيه، ومهامّ أهله.
 *
 * صفحة `roles` كانت تجمع الأقسام الأربعة في مكان واحد، فيقرأ مندوب المبيعات
 * ما يخصّ التصميم (خالد، ١٢ سبتمبر ٢٠٢٦: «أي حاجة تخص أي قسم، شيلها وحطها في قسمها»).
 * فبقي هناك ما هو عابرٌ للأقسام — الرحلة ولوحة الإسناد — ونزل هنا ما لكل قسم وحده.
 */
export function DeptRoles({ deptKey }: { deptKey: string }) {
  const asks = ROLE_ASKS.filter((a) => a.dept === deptKey);
  const people = PEOPLE.filter((p) => p.deptKey === deptKey);
  const ids = new Set(people.map((p) => p.id));
  const duties = DUTIES.filter((d) => ids.has(d.owner) && !d.parked);
  if (!asks.length && !duties.length) return null;

  const stageTitle = (key: string) => STAGES.find((s) => s.key === key)?.title ?? key;

  return (
    <section className="space-y-3" id="dept-roles">
      <div>
        <h2 className="text-lg font-bold">الدور والمهامّ</h2>
        <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
          ما يُنتظر منك في هذا القسم، ثم مهامّك واحدةً واحدة. والصورة الكاملة — الرحلة وكل
          الأقسام — في <a href="/playbook/roles" className="font-bold text-primary hover:underline">من يفعل ماذا</a>.
        </p>
      </div>

      {asks.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {asks.map((ask) => (
            <article key={ask.who} className="rounded-xl border bg-card p-4">
              <h3 className="text-[14.5px] font-bold">{ask.who}</h3>
              <p className="mt-2.5 text-[13px] font-bold text-primary">{ask.question}</p>
              <p className="mt-1.5 text-[13px] leading-7 text-muted-foreground">{ask.answer}</p>
            </article>
          ))}
        </div>
      ) : null}

      {duties.length ? (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14.5px] font-bold">مهامّ القسم</h3>
            <span className="rounded-md border bg-muted px-2 py-0.5 text-[12px] font-bold text-muted-foreground">
              {duties.length}
            </span>
          </div>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {duties.map((d) => {
              const owner = PEOPLE.find((p) => p.id === d.owner);
              return (
                <li key={d.n} className="flex items-start gap-2 rounded-lg border bg-background p-2.5">
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">{d.n}</span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium">{d.t}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {owner?.name} · {stageTitle(d.stage)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
