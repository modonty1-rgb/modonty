"use client";

import { useActionState } from "react";
import { Undo2 } from "lucide-react";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { refundOrderAction } from "../actions/refund-order";

/**
 * تسجيلُ استرداد — يطلب سبباً ويسمّي المبلغ قبل التأكيد.
 *
 * ضغطةٌ هنا تسحب مالاً من تقرير المبيعات، فتُعامَل كما يُعامَل «وصل المبلغ»: مديرُ
 * النظام وحده · سببٌ مكتوب · سطرٌ في سجلّ التدقيق يقول مَن ومتى ولماذا.
 */
export function RefundOrderButton({ orderId, amountLabel, buyerName }: { orderId: string; amountLabel: string; buyerName: string }) {
  const [state, action, pending] = useActionState(refundOrderAction, null);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-[12px] text-destructive hover:text-destructive">
          <Undo2 className="size-4" aria-hidden />
          تسجيل استرداد
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <form action={action}>
          <input type="hidden" name="orderId" value={orderId} />
          <AlertDialogHeader>
            <AlertDialogTitle>تسجيل استرداد {amountLabel} لـ«{buyerName}»؟</AlertDialogTitle>
            <AlertDialogDescription>
              يخرج الطلب من الإيراد فوراً ويصير «مسترد». المالُ يُردّ في البنك بيدك — هذا تسجيلٌ لما حصل.
              ولا يُفكّ حساب العميل: إيقافُ الخدمة قرارٌ آخر من كرته.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-3">
            {state?.error && <p className="mb-2 text-[12px] text-destructive">{state.error}</p>}
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              سبب الاسترداد
              <Input name="reason" required minLength={3} maxLength={300} placeholder="مثال: ألغى الاشتراك في أوّل أسبوع" />
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={pending}>تأكيد الاسترداد</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
