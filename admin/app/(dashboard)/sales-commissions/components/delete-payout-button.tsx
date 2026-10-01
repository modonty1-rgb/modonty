"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { deleteCommissionPayoutAction } from "../actions/delete-commission-payout";

/** Removes a payout entered by mistake — confirmed first, logged in the audit trail. */
export function DeletePayoutButton({ payoutId, label }: { payoutId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" size="icon" variant="ghost" className="size-7 text-muted-foreground hover:text-destructive" aria-label={`حذف صرفيّة ${label}`}>
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>حذف صرفيّة {label}؟</AlertDialogTitle>
          <AlertDialogDescription>للصرفيّة المسجَّلة خطأً فقط. ترجع طلباتها لجدول «لسه ما انصرف»، ويبقى أثرها في سجلّ التدقيق.</AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>إلغاء</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await deleteCommissionPayoutAction(payoutId);
                if (res.ok) setOpen(false);
                else setError(res.error ?? "تعذّر الحذف");
              })
            }
          >
            {pending && <Loader2 className="me-2 size-4 animate-spin" aria-hidden />}
            حذف
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
