"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { archiveReel, republishReel } from "../actions/reel-lifecycle";

/**
 * جزيرة العميل الوحيدة في شاشات السجلّ.
 *
 * القائمة نفسها تبقى مكوّن سيرفر، وهذا الزرّ وحده يحمل `"use client"` — فبطاقةٌ فيها فعل
 * لا تجرّ عشرين بطاقةً أخرى إلى المتصفّح.
 *
 * والفعلان كلاهما خلف تأكيد: كلاهما يغيّر ما يراه الزائر على مودونتي فوراً، والقاعدة
 * «Confirm destructive actions» لا تسأل هل الفعل يحذف، بل هل يصعب التراجع عنه أمام جمهور.
 */
export function ReelLifecycleButton({
  id,
  title,
  action,
}: {
  id: string;
  title: string | null;
  action: "archive" | "republish";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const name = title?.trim() || "هذا الريل";
  const isArchive = action === "archive";

  const run = () => {
    startTransition(async () => {
      const result = isArchive ? await archiveReel(id) : await republishReel(id);
      if (result.success) {
        toast(
          isArchive
            ? { title: "انسحب من الواجهة", description: `«${name}» ما عاد يشوفه الزائر. صفّه وتفاعله محفوظان، وتقدر ترجّعه من «مؤرشف».` }
            : { title: "رجع للواجهة", description: `«${name}» صار حيّاً في الطلّات من جديد.` },
        );
        router.refresh();
      } else {
        toast({
          title: isArchive ? "ما انسحب" : "ما رجع",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" disabled={isPending}>
          {isArchive ? (
            <>
              <Archive className="h-3.5 w-3.5" aria-hidden />
              اسحبه من الواجهة
            </>
          ) : (
            <>
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
              رجّعه للواجهة
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>
            {isArchive ? `تسحب «${name}» من مودونتي؟` : `ترجّع «${name}» لمودونتي؟`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchive
              ? "بيختفي من الطلّات ومن صفحته الخاصة على طول. الصفّ والتعليقات والمشاهدات تبقى، وتقدر ترجّعه في أي وقت من «مؤرشف»."
              : "بيظهر للزوار من جديد بنفس عنوانه ووصفه. لو ناقصه عنوان أو وصف، ما بيرجع — والرسالة بتقول لك أي حقل."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={run}>
            {isArchive ? "نعم، اسحبه" : "نعم، رجّعه"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
