import { Ban } from "lucide-react";

import { PROHIBITIONS, SEVERITY } from "./helpers/prohibitions-data";

/**
 * ممنوعات قسم واحد. الصفحة الجامعة بقيت فهرسًا، والتفصيل نزل إلى من يعنيه
 * (خالد، ١٢ سبتمبر ٢٠٢٦) — فلا يقرأ المصمّم ممنوعات الفهرسة ولا المحرّر ممنوعات اللوقو.
 */
export function DeptProhibitions({ deptKey }: { deptKey: string }) {
  /**
   * الفرز بالبند لا بالمجموعة: «Orphan Pages» تحت التقني وهي شغل محرّر، و«تصميم غير
   * متجاوب» تحت تجربة المستخدم وهي شغل مصمّم (خالد، ١٢ سبتمبر ٢٠٢٦). فبندٌ بلا `dept`
   * يتبع مجموعته، وبندٌ موسوم يذهب حيث وُسم.
   */
  const groups = PROHIBITIONS.map((c) => ({
    ...c,
    items: c.items.filter((i) => (i.dept ?? c.dept) === deptKey),
  })).filter((c) => c.items.length);
  if (!groups.length) return null;
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section className="space-y-3" id="dept-prohibitions">
      <div className="flex items-center gap-2">
        <Ban className="h-4.5 w-4.5 text-red-400" />
        <h2 className="text-lg font-bold">ممنوعات القسم</h2>
        <span className="rounded-md border border-red-500/40 bg-red-500/[0.08] px-2 py-0.5 text-[12px] font-bold text-red-400">
          {total}
        </span>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.category} className="rounded-xl border border-red-500/25 bg-red-500/[0.02] p-4">
              <div className="flex items-center gap-2 border-b border-red-500/20 pb-2.5">
                <Icon className="h-4 w-4 shrink-0 text-red-400" />
                <h3 className="text-[14px] font-bold leading-5">{group.category}</h3>
              </div>
              <ul className="mt-3 space-y-2.5">
                {group.items.map((item) => {
                  const sev = SEVERITY[item.severity];
                  return (
                    <li key={item.name} className="flex gap-2.5">
                      <span aria-hidden className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${sev.dot}`} />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium leading-6">{item.name}</span>
                        <span className="block text-[12px] leading-5 text-muted-foreground">{item.consequence}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-[12px] text-muted-foreground">🔴 خطر فوري · 🟠 يخفض الترتيب · 🟡 يضعف الموقع</p>
    </section>
  );
}
