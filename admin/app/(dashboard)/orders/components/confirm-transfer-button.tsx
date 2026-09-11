"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * PAY-Q12's mandatory guard: a click here creates money in the ledger (AWAITING_TRANSFER →
 * PAID), so it names the buyer and amount before confirming, requires a transfer reference
 * and date, and is ADMIN-only server-side (confirmOrderPaymentAction → requireFinanceAdmin).
 */
export function ConfirmTransferButton({ action, buyerName, amountLabel }: { action: (form: FormData) => Promise<void>; buyerName: string; amountLabel: string }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button">وصل المبلغ</Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <form action={action}>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد وصول {amountLabel} من «{buyerName}»؟</AlertDialogTitle>
            <AlertDialogDescription>سينتقل الطلب فوراً إلى «مدفوع» ولا يمكن التراجع عن هذا التأكيد. أدخل مرجع التحويل وتاريخه كما ظهرا في كشف الحساب.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-3">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              مرجع التحويل
              <Input name="transferReference" required maxLength={80} placeholder="رقم العملية أو المرجع البنكي" />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              تاريخ التحويل
              <Input name="transferDate" type="date" required defaultValue={today} max={today} />
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
            <AlertDialogAction type="submit">تأكيد الوصول</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
