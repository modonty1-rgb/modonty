"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PhoneMissed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { addFollowUp } from "../actions";
import { NO_ANSWER_BODY } from "../helpers/no-answer";

/**
 * «ما ردّ» — a call that nobody answered, logged in one click. The lead stays «جديد»
 * (helpers/no-answer.ts).
 *
 * It sits beside «اتصال», not inside the log form (Khalid, 28 Sep 2026: «موقع ما ردّ ملخبط»):
 * between the date and «تسجيل» it read as a second save button. Call, then either type what was
 * said or press this.
 */
export function NoAnswerButton({
  leadId,
  onLogged,
  className,
}: {
  leadId: string;
  onLogged?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const log = () =>
    start(async () => {
      const r = await addFollowUp(leadId, { channel: "CALL", happenedAt: new Date(), body: NO_ANSWER_BODY });
      if (!r.success) {
        toast({ title: r.error, variant: "destructive" });
        return;
      }
      onLogged?.();
      toast({ title: "سُجِّلت محاولة — ما ردّ", variant: "success" });
      router.refresh();
    });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={log}
      disabled={pending}
      className={cn("h-8 gap-1.5 text-xs text-muted-foreground", className)}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <PhoneMissed className="size-3.5" aria-hidden />}
      ما ردّ
    </Button>
  );
}
