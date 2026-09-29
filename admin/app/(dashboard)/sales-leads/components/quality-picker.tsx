"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { setLeadQuality } from "../actions";

type Quality = "GOOD" | "WEAK" | "INVALID";

export const QUALITY_LABEL: Record<Quality, string> = { GOOD: "مناسب", WEAK: "ضعيف", INVALID: "مو صالح" };
export const QUALITY_TEXT: Record<Quality, string> = {
  GOOD: "text-emerald-700 dark:text-emerald-400",
  WEAK: "text-amber-700 dark:text-amber-400",
  INVALID: "text-rose-700 dark:text-rose-400",
};
const ON: Record<Quality, string> = {
  GOOD: "border-emerald-600 bg-emerald-600 text-white",
  WEAK: "border-amber-500 bg-amber-500 text-white",
  INVALID: "border-rose-600 bg-rose-600 text-white",
};

/**
 * «العميل هذا: مناسب · ضعيف · مو صالح» — ضغطة بعد أوّل تواصل (خالد ٢٩ سبتمبر ٢٠٢٦: فيدباك المبيعات
 * للميديا باير). الضغط على المختار يمسحه. يظهر فوراً ويُحفظ خلفه.
 */
export function QualityPicker({ leadId, value }: { leadId: string; value: Quality | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [shown, setShown] = useOptimistic(value);

  const pick = (q: Quality) =>
    start(async () => {
      const next = shown === q ? null : q;
      setShown(next);
      const r = await setLeadQuality(leadId, next);
      if (!r.success) {
        toast({ title: r.error, variant: "destructive" });
        return;
      }
      router.refresh();
    });

  return (
    <span role="radiogroup" aria-label="جودة العميل" className="inline-flex items-center gap-1">
      <span className="text-[11px] text-muted-foreground">جودة العميل:</span>
      {(Object.keys(QUALITY_LABEL) as Quality[]).map((q) => (
        <button
          key={q}
          type="button"
          role="radio"
          aria-checked={shown === q}
          disabled={pending}
          onClick={() => pick(q)}
          className={cn(
            "h-8 rounded-md border px-2.5 text-xs font-medium transition-colors disabled:opacity-60",
            shown === q ? ON[q] : cn("bg-background hover:bg-muted", QUALITY_TEXT[q]),
          )}
        >
          {QUALITY_LABEL[q]}
        </button>
      ))}
    </span>
  );
}
