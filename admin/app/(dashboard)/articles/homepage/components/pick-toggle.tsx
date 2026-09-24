"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { setHomepagePick } from "../actions";

/** زرُّ «في الرئيسية» لكلّ مقال — يتبدّل فوراً ويُرجَع إن رفض الخادم. */
/** `full`: اكتملت الخانات — «اختر» يُعطَّل ويقول لماذا، والمختارُ يبقى قابلاً للإزالة. */
export function PickToggle({ articleId, picked, full = false }: { articleId: string; picked: boolean; full?: boolean }) {
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
      disabled={isPending || (full && !optimistic)}
      title={full && !optimistic ? "اكتملت الخانات العشر — أزل مقالاً أوّلاً" : undefined}
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
