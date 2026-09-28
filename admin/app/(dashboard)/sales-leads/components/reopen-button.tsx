"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { reopenLead } from "../actions";

/**
 * الخسارة قرارٌ يُراجَع لا حائط — عميلٌ قال «مش دلوقتي» يرجع بعد ثلاثة شهور.
 * يبقى للعملاء الذين أُغلقوا كخسارة قبل ٢٨ سبتمبر ٢٠٢٦؛ الإغلاقُ الجديد صار حذفاً (DeleteLeadDialog).
 */
export function ReopenButton({ leadId, className }: { leadId: string; className?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("gap-1.5", className)}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await reopenLead(leadId);
          if (r.success) {
            toast({ title: "أرجعه للقائمة", variant: "success" });
            router.refresh();
          } else {
            toast({ title: r.error, variant: "destructive" });
          }
        })
      }
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" aria-hidden />}
      أرجعه للقائمة
    </Button>
  );
}
