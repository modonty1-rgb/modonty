"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

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
import { activateClientAction } from "../actions/activate-client";

interface Props {
  clientId: string;
  clientName: string;
}

export function ActivateClientButton({ clientId, clientName }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleActivate() {
    startTransition(async () => {
      const res = await activateClientAction(clientId);
      if (res.ok) {
        toast({
          title: "تم تفعيل العميل",
          description:
            "emailSent" in res && res.emailSent
              ? `${clientName} — أُرسلت بيانات الدخول للعميل عبر الإيميل.`
              : `${clientName} — نشط الآن. (تعذّر إرسال إيميل الدخول — أرسله يدوياً.)`,
        });
        setOpen(false);
        router.refresh();
      } else {
        toast({ title: "فشل التفعيل", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
          title="Activate client"
        >
          <CheckCircle2 className="h-3 w-3" />
          Activate
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl" onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>تفعيل العميل {clientName}؟</AlertDialogTitle>
          <AlertDialogDescription>
            حيتحوّل العميل من PENDING إلى ACTIVE. السلَج يُقفل بعد التفعيل — لا يمكن تغييره إلا بـ OTP.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={pending}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleActivate();
            }}
            disabled={pending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {pending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            نعم، فعّل
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
