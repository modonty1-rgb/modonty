"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { ArticleStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

import { resetArticleStatusAction } from "../../actions/reset-status";
import { getStatusLabel } from "../../../helpers/status-utils";

interface Props {
  articleId: string;
  articleTitle: string;
  currentStatus: ArticleStatus;
  targets: ArticleStatus[];
}

/** One "Reset to <stage>" button per allowed rollback target, each with a confirm dialog. */
export function MaintenanceRowActions({ articleId, articleTitle, currentStatus, targets }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingTarget, setPendingTarget] = useState<ArticleStatus | null>(null);

  if (targets.length === 0) {
    return <span className="text-xs text-muted-foreground">لا يوجد ترجيع متاح</span>;
  }

  const handleReset = (toStatus: ArticleStatus) => {
    setPendingTarget(toStatus);
    startTransition(async () => {
      const res = await resetArticleStatusAction(articleId, toStatus);
      if (res.success) {
        toast({
          title: "تم ترجيع الحالة",
          description: `${articleTitle} → ${getStatusLabel(toStatus)}`,
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "تعذّر الترجيع",
          description: res.error ?? "حدث خطأ غير معروف",
        });
      }
      setPendingTarget(null);
    });
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      {targets.map((target) => (
        <AlertDialog key={target}>
          <AlertDialogTrigger asChild>
            <Button type="button" size="sm" variant="outline" disabled={isPending} className="gap-1.5">
              {pendingTarget === target ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Reset to {getStatusLabel(target)}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ترجيع الحالة إلى {getStatusLabel(target)}؟
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <span className="block">
                  المقال سيرجع من {getStatusLabel(currentStatus)} إلى {getStatusLabel(target)}.
                  سيُلغى أي جدولة أو موافقة عميل سابقة، ويعيد المرور بالدائرة من جديد.
                </span>
                <span className="block font-semibold text-foreground" dir="rtl">
                  {articleTitle}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleReset(target)} disabled={isPending}>
                نعم، رجّع الحالة
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </div>
  );
}
