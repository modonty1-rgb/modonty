"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { setHomepagePick } from "../actions";

/** زرُّ «في الرئيسية» لكلّ مقال — يتبدّل فوراً ويُرجَع إن رفض الخادم. */
export function PickToggle({ articleId, picked }: { articleId: string; picked: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(picked);

  const toggle = () =>
    startTransition(async () => {
      setOptimistic(!optimistic);
      const res = await setHomepagePick({ articleId, picked: !optimistic });
      if (!res.success) toast({ title: "لم يُحفظ", description: res.error, variant: "destructive" });
      router.refresh();
    });

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={optimistic}
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-60",
        optimistic ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
      )}
    >
      {optimistic ? "★ في الرئيسية" : "☆ اختر للرئيسية"}
    </button>
  );
}
