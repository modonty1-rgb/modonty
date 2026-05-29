"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  removeTestSubscribersAction,
  countTestSubscribersAction,
} from "../actions/remove-test-subscribers";

export function RemoveTestSubscribersButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<{ subscribers: number; clients: number } | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setCounts(null);
      countTestSubscribersAction().then(setCounts);
    }
  }

  function handleRemove() {
    startTransition(async () => {
      const res = await removeTestSubscribersAction();
      if (res.ok) {
        toast({
          title: "Test data removed",
          description: `${res.subscribersDeleted} subscribers · ${res.clientsDeleted} clients deleted`,
        });
        setOpen(false);
        router.refresh();
      } else {
        toast({ title: "Remove failed", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 border-dashed border-red-500/50 text-red-600 dark:text-red-400"
          title="Delete all seeded test subscribers + their converted clients"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove Test Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>حذف بيانات الاختبار؟</AlertDialogTitle>
          <AlertDialogDescription>
            {counts === null ? (
              "جاري حساب البيانات التجريبية..."
            ) : counts.subscribers === 0 ? (
              "لا توجد بيانات تجريبية للحذف."
            ) : (
              <>
                حيتم حذف <strong>{counts.subscribers}</strong> مشترك تجريبي و{" "}
                <strong>{counts.clients}</strong> عميل محوّل (مع إيميلاتهم). يطابق فقط
                السجلات اللي تبدأ بـ <code>test-</code> — مستحيل يلمس عميل حقيقي.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={pending}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRemove();
            }}
            disabled={pending || counts === null || counts.subscribers === 0}
            className="bg-red-600 hover:bg-red-700"
          >
            {pending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            نعم، احذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
