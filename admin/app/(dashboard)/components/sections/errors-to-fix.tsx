import Link from "next/link";
import { Wrench, AlertTriangle, CheckCircle2, ChevronLeft } from "lucide-react";

import { getErrorsToFix } from "@/app/(dashboard)/actions/errors-to-fix";
import { SummaryChip } from "../dashboard-ui";
import { CollapsibleSection } from "../collapsible-section";

/**
 * «Errors to fix» — data problems needing a human. Reusable: every category comes from
 * getErrorsToFix(); add a check there and it renders here. First category: invalid WhatsApp numbers.
 */
export async function ErrorsToFix() {
  const categories = await getErrorsToFix();
  const total = categories.reduce((s, c) => s + c.items.length, 0);

  return (
    <CollapsibleSection
      iconNode={<Wrench className="h-4 w-4 text-muted-foreground" />}
      title="Errors to fix"
      subtitle="مشاكل تحتاج معالجة يدوية"
      storageKey="dashErrorsToFixOpen"
      summary={<SummaryChip icon={AlertTriangle} value={total} tier={total > 0 ? "warm" : "ok"} />}
      right={
        total > 0 ? (
          <span className="flex items-baseline gap-1.5 text-xs text-muted-foreground">
            <span className="text-base font-bold tabular-nums text-amber-600 dark:text-amber-400">{total}</span>
            بحاجة إصلاح
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> لا مشاكل
          </span>
        )
      }
    >
      {total === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          كل شي سليم — لا توجد مشاكل تحتاج معالجة يدوية.
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.key} className="overflow-hidden rounded-xl border">
              <div className="flex items-center gap-2 border-b bg-amber-500/[0.06] px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[13px] font-bold">{cat.title}</span>
                <span className="ms-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {cat.items.length}
                </span>
              </div>
              <ul className="divide-y">
                {cat.items.map((it) => (
                  <li key={it.id}>
                    <Link href={it.href} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">{it.label}</p>
                        <p className="truncate text-[11px] text-muted-foreground" dir="ltr">{it.detail}</p>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                        إصلاح
                        <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
