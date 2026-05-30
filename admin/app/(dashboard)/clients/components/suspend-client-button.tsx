"use client";

import { useState } from "react";
import { PauseCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Props {
  clientId: string;
  clientName: string;
}

export function SuspendClientButton({ clientId, clientName }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Visual-only for now — DB transition wired once the target status is decided.
  function handleSuspend() {
    toast({
      title: "إيقاف الحساب",
      description: "قيد البناء — نحدّد الحالة المستهدفة بعد قرارك.",
    });
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400 hover:bg-red-500/25"
          title="Suspend client"
        >
          <PauseCircle className="h-3 w-3" />
          Suspend
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>إيقاف حساب {clientName}؟</AlertDialogTitle>
          <AlertDialogDescription>
            حيتوقف حساب العميل عن النشاط. (تحدّد التفاصيل الدقيقة عند ربط العملية.)
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleSuspend();
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            نعم، أوقف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
