"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { deleteLead } from "../actions";

/**
 * حذفُ العميل المحتمل نهائياً — بدل «خسرناه» (خالد ٢٨ سبتمبر ٢٠٢٦). تأكيدٌ واحد يقول ما
 * يذهب معه، لأنه لا رجعة منه: الصفّ وسجلّ متابعاته. والرفضُ (صار عميلاً · عليه طلب) يأتي من
 * الخادم ويظهر كما هو.
 */
export function DeleteLeadDialog({ leadId, leadName, className }: { leadId: string; leadName: string; className?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const confirm = () =>
    start(async () => {
      const r = await deleteLead(leadId);
      if (r.success) {
        setOpen(false);
        toast({ title: `حُذف ${leadName}`, variant: "success" });
        // From the lead's page this leaves it; from the list's «+» it is the same URL, so refresh.
        router.push("/sales-leads");
        router.refresh();
      } else {
        toast({ title: r.error, variant: "destructive" });
      }
    });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-1.5 text-destructive hover:text-destructive", className)}>
          <Trash2 className="size-3.5" aria-hidden /> حذف
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl" className="sm:max-w-md">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>حذف {leadName} نهائياً؟</AlertDialogTitle>
          <AlertDialogDescription>
            يُحذف العميل المحتمل وكل سجلّ متابعاته، ولا يمكن إرجاعه.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-start">
          <AlertDialogAction
            onClick={(e) => {
              // Keep the dialog open while the delete runs — it closes on success only.
              e.preventDefault();
              confirm();
            }}
            disabled={pending}
            className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "جارٍ الحذف…" : "احذفه"}
          </AlertDialogAction>
          <AlertDialogCancel disabled={pending}>إلغاء</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
