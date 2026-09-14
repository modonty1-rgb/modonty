import { CheckCircle2, XCircle } from "lucide-react";

import { situations } from "../helpers/persona";

/**
 * ماذا تقول حين يحدث كذا — مواقف هذا القسم وحدها.
 *
 * كانت الستّة في صفحة `/playbook/persona`، فحُذفت الصفحة ووُزّعت بأمر خالد
 * (١٢ سبتمبر ٢٠٢٦): «ودّي كل واحد لقسمه. الداتا اللي تخصّ القسم، ودّيها عليه».
 * والنبرة نفسها — القواعد الثلاث والكلمات — بقيت في «ما هي مدونتي؟» لأنها تحكم
 * كل ما يُكتب ويُقال، فلا قسم تخصّه.
 */
export function DeptVoice({ deptKey }: { deptKey: string }) {
  const mine = situations.filter((s) => s.dept === deptKey);
  if (!mine.length) return null;

  return (
    <section className="space-y-3" id="voice">
      <div>
        <h2 className="text-[16px] font-bold">ماذا تقول حين يحدث هذا</h2>
        <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
          خذ الجملة الجاهزة وعدّل عليها باسم شريكك.
        </p>
      </div>
      <div className="space-y-2.5">
        {mine.map((s) => (
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
  );
}
