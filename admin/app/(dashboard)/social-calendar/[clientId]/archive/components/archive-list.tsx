"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { toast } from "@/hooks/use-toast";

import { restoreSocialPost } from "../../../actions";
import { StatusBadge } from "../../../components/status-badge";
import { MONTH_LABELS, monthParamOfDate } from "../../../helpers/dates";
import { postHref } from "../../../helpers/post-href";
import type { SocialPostRow } from "../../../helpers/queries";
import { FORMAT_LABEL, FUNNEL_LABEL } from "../../../helpers/social-labels";

/**
 * المنشورات المؤرشفة مجمّعة بالشهر + «استرجاع» (القديم `ArchiveClient.tsx`). الاسترجاع يعيد
 * المنشور لنفس يومه وحالته. الزرّ لمن يملك الأرشفة فقط.
 */
export function ArchiveList({
  posts,
  clientId,
  canRestore,
}: {
  posts: SocialPostRow[];
  clientId: string;
  canRestore: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function restore(id: string) {
    startTransition(async () => {
      const res = await restoreSocialPost(id);
      if (res.success) {
        toast({ title: "تم الاسترجاع — المنشور عاد للجدول", variant: "success" });
        router.refresh();
      } else {
        toast({ title: res.error, variant: "destructive" });
      }
    });
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <RotateCcw className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium">لا يوجد محتوى مؤرشف</p>
        <p className="text-xs text-muted-foreground/70">المحتوى المؤرشف سيظهر هنا ويمكنك استرجاعه في أي وقت</p>
      </div>
    );
  }

  const groups = new Map<string, SocialPostRow[]>();
  for (const p of posts) {
    const key = monthParamOfDate(p.scheduledFor);
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }

  return (
    <div className="space-y-6 p-5">
      {[...groups.entries()].map(([month, items]) => {
        const [y, m] = month.split("-").map(Number);
        return (
          <div key={month}>
            <h3 className="mb-3 px-1 text-xs font-bold text-muted-foreground/70">
              {MONTH_LABELS[m - 1]} {y}
            </h3>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {items.map((p) => (
                <div key={p.id} className="flex items-center gap-4 bg-card px-4 py-3 transition-colors hover:bg-muted/30">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold tabular-nums text-muted-foreground">
                    {p.scheduledFor.getUTCDate()}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link href={postHref(clientId, p.id)} className="block truncate text-sm font-medium text-foreground hover:underline">
                      {p.idea || <span className="text-xs italic text-muted-foreground">بدون فكرة</span>}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                      {p.format && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {FORMAT_LABEL[p.format]}
                        </span>
                      )}
                      {p.funnelStages.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:bg-violet-950 dark:text-violet-300"
                        >
                          {FUNNEL_LABEL[s]}
                        </span>
                      ))}
                      <StatusBadge status={p.status} dot={false} className="px-2" />
                    </div>
                  </div>
                  {canRestore && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => restore(p.id)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground disabled:opacity-60"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      استرجاع
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
