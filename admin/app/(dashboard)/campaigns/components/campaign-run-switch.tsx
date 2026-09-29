"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, Square } from "lucide-react";

import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { setCampaignRun } from "../actions";

/**
 * «تشغيل» / «إيقاف» — زرٌّ واحد للأدمن: «تشغيل» على الموافَق عليها والموقوفة، و«إيقاف» على الشغّالة (خالد ٢٩ سبتمبر ٢٠٢٦: «الحملة ممكن
 * توقف وبعدين نرجع نشغّلها»). الإيقاف بتأكيد لأنه يطلب من الميديا باير إيقافها في ميتا؛ التشغيل مباشر.
 */
export function CampaignRunSwitch({
  id,
  code,
  stopped,
  runningInMeta,
}: {
  id: string;
  code: string;
  stopped: boolean;
  runningInMeta: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const run = (on: boolean) =>
    start(async () => {
      const r = await setCampaignRun(id, on);
      if (!r.success) {
        toast({ title: r.error, variant: "destructive" });
        return;
      }
      setOpen(false);
      toast({ title: on ? `اشتغلت ${code}` : `توقّفت ${code}`, variant: "success" });
      router.refresh();
    });

  if (stopped) {
    return (
      <Button type="button" size="sm" disabled={pending} onClick={() => run(true)} className="h-7 gap-1 px-2.5 text-[11px]">
        {pending ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3" aria-hidden />}
        تشغيل
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" disabled={pending} className="h-7 gap-1 px-2.5 text-[11px]">
          <Square className="size-3" aria-hidden /> إيقاف
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>إيقاف <span dir="ltr" className="font-mono">{code}</span>؟</AlertDialogTitle>
          <AlertDialogDescription>
            تنتقل إلى «موقوفة» وتبقى أرقامها، وترجّعها بـ«تشغيل» متى شئت.{" "}
            {runningInMeta ? "وهي شغّالة الآن في ميتا — ليوقفها الميديا باير هناك، وإلّا ظهرت تنبيهاً." : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" disabled={pending}>تراجع</AlertDialogCancel>
          <Button type="button" variant="destructive" disabled={pending} onClick={() => run(false)}>
            {pending && <Loader2 className="me-2 size-4 animate-spin" aria-hidden />}
            إيقاف
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
