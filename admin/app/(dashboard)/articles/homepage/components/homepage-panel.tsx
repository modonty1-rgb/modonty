"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Loader2, X } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { reorderHomepagePicks, setHomepagePick } from "../actions";

export interface SlotRow {
  id: string;
  title: string;
  industry: string;
}

const N = new Intl.NumberFormat("ar-EG");

/**
 * **الرئيسية — اختياراتي وحدها، بعدّاد** (خالد ٢٤ سبتمبر ٢٠٢٦: «المفروض يجيني بس الأربعة… كلّ ما
 * أختار تضيف، أوصل لعشرة تديني مسج أو عدّاد كم باقي لي»). ما يملؤه الأحدثُ تلقائيّاً خرج من اللوحة،
 * وكذلك تقسيمُ المجالات. والعدّادُ من خانات الصفحة الأولى (`slots`)، والخادمُ يرفض الحادي عشر.
 */
export function HomepagePanel({ picks, slots }: { picks: SlotRow[]; slots: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useOptimistic(picks);

  const run = (next: SlotRow[], action: () => Promise<{ success: boolean; error?: string }>) =>
    startTransition(async () => {
      setRows(next);
      const res = await action();
      if (!res.success) toast({ title: "لم يُحفظ", description: res.error, variant: "destructive" });
      router.refresh();
    });

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    run(next, () => reorderHomepagePicks({ articleIds: next.map((r) => r.id) }));
  };
  const remove = (id: string) => run(rows.filter((r) => r.id !== id), () => setHomepagePick({ articleId: id, picked: false }));

  const left = Math.max(0, slots - rows.length);
  const full = left === 0;

  return (
    <section aria-label="الرئيسية" aria-busy={isPending} className="rounded-xl border bg-card">
      <header className="space-y-1.5 border-b px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold">الرئيسية</h2>
          {isPending ? (
            <span role="status" className="flex items-center gap-1 text-[11px] font-semibold text-primary">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              جارٍ الحفظ
            </span>
          ) : (
            <span className={cn("text-[11.5px] font-semibold tabular-nums", full ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
              {N.format(rows.length)} من {N.format(slots)}
              {full ? "" : ` · باقي ${N.format(left)}`}
            </span>
          )}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div
            className={cn("h-full rounded-full transition-[width] duration-300", full ? "bg-emerald-500" : "bg-primary")}
            style={{ width: `${Math.min(100, (rows.length / slots) * 100)}%` }}
          />
        </div>
        {full ? (
          <p role="status" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            اكتملت الخانات العشر — أزل مقالاً لتضيف غيره.
          </p>
        ) : null}
      </header>

      {rows.length === 0 ? (
        <p className="px-3 py-6 text-center text-[12px] text-muted-foreground">لم تختر مقالاً بعد — اختر من المكتبة.</p>
      ) : (
        <ol className={cn("divide-y transition-opacity", isPending && "pointer-events-none opacity-60")}>
          {rows.map((r, i) => (
            <li key={r.id} className="flex items-center gap-2 px-2 py-1.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground tabular-nums">
                {N.format(i + 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium">{r.title}</span>
                <span className="block truncate text-[10.5px] text-muted-foreground">{r.industry}</span>
              </span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="أعلى" className="grid size-6 place-items-center rounded hover:bg-muted disabled:opacity-25">
                <ChevronUp className="size-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="أسفل" className="grid size-6 place-items-center rounded hover:bg-muted disabled:opacity-25">
                <ChevronDown className="size-3.5" />
              </button>
              <button type="button" onClick={() => remove(r.id)} aria-label="إزالة من الرئيسية" className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-destructive">
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
