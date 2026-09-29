"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";

import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { decideCampaign } from "../actions";

/**
 * موافقة أو رفض البريف — للأدمن وحده، على البطاقة نفسها. الرفض يطلب سبباً يقرؤه الميديا باير؛
 * والحوار يُغلق بالنجاح وحده، فلا تُقرأ رسالة الرفض في حوارٍ اختفى.
 */
export function CampaignDecision({ id, code }: { id: string; code: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const decide = (decision: "APPROVED" | "REJECTED") =>
    start(async () => {
      const r = await decideCampaign(id, decision, note);
      if (!r.success) {
        toast({ title: r.error, variant: "destructive" });
        return;
      }
      setOpen(false);
      toast({ title: decision === "APPROVED" ? `وُوفق على ${code}` : `رُفض ${code}`, variant: "success" });
      router.refresh();
    });

  return (
    <span className="flex items-center gap-1.5">
      <Button type="button" size="sm" disabled={pending} onClick={() => decide("APPROVED")} className="h-7 gap-1 px-2.5 text-[11px]">
        {pending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" aria-hidden />}
        موافقة
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button" size="sm" variant="outline" disabled={pending} className="h-7 gap-1 px-2.5 text-[11px] text-destructive hover:text-destructive">
            <X className="size-3" aria-hidden /> رفض
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>رفض <span dir="ltr" className="font-mono">{code}</span>؟</AlertDialogTitle>
            <AlertDialogDescription>اكتب السبب — يقرؤه الميديا باير ويعدّل البريف عليه.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="السقف أعلى من المتوقّع لهذا الهدف — خلّه ٢٬٠٠٠ ونشوف النتائج."
            className="text-sm"
          />
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>تراجع</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={pending || note.trim().length < 3} onClick={() => decide("REJECTED")}>
              {pending && <Loader2 className="me-2 size-4 animate-spin" aria-hidden />}
              رفض البريف
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </span>
  );
}
