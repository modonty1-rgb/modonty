"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteOrderAction } from "../actions/delete-order";

/**
 * حذفُ الطلب نهائياً — للأدمن وحده، من صفحة الطلب نفسها (خالد ٢٨ سبتمبر ٢٠٢٦).
 * نفس حارس «إلغاء الطلب»: رقم الطلب يُكتب باليد، وبعد النجاح يعود السيرفر إلى جدول الطلبات.
 */
export function DeleteOrderButton({
  orderId,
  orderNumber,
  buyerName,
  invoiceNumber,
}: {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  invoiceNumber: string | null;
}) {
  const [state, action, pending] = useActionState(deleteOrderAction, null);
  const [open, setOpen] = useState(false);

  // Success redirects on the server (actions/delete-order.ts); this only closes on a stale reply.
  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  const last4 = orderNumber.replace(/\D/g, "").slice(-4);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-[12px] text-destructive hover:text-destructive">
          <Trash2 className="size-4" aria-hidden />
          حذف الطلب
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <form action={action}>
          <input type="hidden" name="orderId" value={orderId} />
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الطلب {orderNumber} لـ«{buyerName}» نهائياً؟</AlertDialogTitle>
            <AlertDialogDescription>
              يُرفع من جدول الطلبات مع عمليّات الدفع
              {invoiceNumber ? <> وفاتورته <b className="font-mono">{invoiceNumber}</b></> : null}، ولا يمكن إرجاعه.
              العميل لا يُمسّ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-3">
            {state?.error && (
              <p role="alert" className="rounded-md bg-destructive/10 px-2.5 py-2 text-[12px] text-destructive">
                {state.error}
              </p>
            )}
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              للتأكيد اكتب <b className="font-mono text-foreground">{orderNumber}</b> أو آخر أربعة أرقام{" "}
              <b className="font-mono text-foreground">{last4}</b>
              <Input name="confirm" required autoComplete="off" dir="ltr" className="font-mono" placeholder={last4} />
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>تراجع</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending && <Loader2 className="me-2 size-4 animate-spin" aria-hidden />}
              احذفه نهائياً
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
