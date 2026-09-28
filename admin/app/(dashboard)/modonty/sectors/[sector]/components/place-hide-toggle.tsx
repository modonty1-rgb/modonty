"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { setPlaceHidden } from "../../actions";

/** «ظاهر / مخفي» for one place in the guide — flips at once and rolls back if the server refuses. */
export function PlaceHideToggle({ placeId, hidden }: { placeId: string; hidden: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(hidden);

  const toggle = () =>
    startTransition(async () => {
      setOptimistic(!optimistic);
      const res = await setPlaceHidden({ placeId, hidden: !optimistic });
      if (!res.success) toast({ title: "لم يُحفظ", description: res.error, variant: "destructive" });
      router.refresh();
    });

  const Icon = isPending ? Loader2 : optimistic ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={optimistic}
      aria-busy={isPending}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-[11.5px] font-semibold transition-colors disabled:opacity-60 aria-busy:cursor-wait",
        optimistic ? "border-destructive/40 bg-destructive/10 text-destructive" : "hover:bg-muted",
      )}
    >
      <Icon className={cn("size-3.5", isPending && "animate-spin")} aria-hidden />
      {optimistic ? "مخفي" : "ظاهر"}
    </button>
  );
}
