"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { PickResult } from "./picks-panel";

interface PickToggleProps {
  articleId: string;
  picked: boolean;
  /** اكتملت الخانات — «اختر» يُعطَّل ويقول لماذا، والمختارُ يبقى قابلاً للإزالة. */
  full?: boolean;
  onPick: (input: { articleId: string; picked: boolean }) => Promise<PickResult>;
}

/** زرُّ «مختار» لكلّ مقال — يتبدّل فوراً ويُرجَع إن رفض الخادم. */
export function PickToggle({ articleId, picked, full = false, onPick }: PickToggleProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(picked);

  const toggle = () =>
    startTransition(async () => {
      setOptimistic(!optimistic);
      const res = await onPick({ articleId, picked: !optimistic });
      if (!res.success) toast({ title: "لم يُحفظ", description: res.error, variant: "destructive" });
      router.refresh();
    });

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending || (full && !optimistic)}
      title={full && !optimistic ? "اكتملت الخانات — أزل مقالاً أوّلاً" : undefined}
      aria-pressed={optimistic}
      aria-busy={isPending}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-[11.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait",
        optimistic ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
      )}
    >
      {/* يدور حتى يعود الخادمُ ويُعاد رسمُ الصفحة — لا زرٌّ يبدو ساكناً وهو يعمل. */}
      {isPending ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          جارٍ الحفظ…
        </>
      ) : optimistic ? (
        "★ مختار"
      ) : (
        "☆ اختر"
      )}
    </button>
  );
}
