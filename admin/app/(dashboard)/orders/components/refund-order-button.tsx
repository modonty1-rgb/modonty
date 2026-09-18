"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Undo2 } from "lucide-react";

import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
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
 *
 * **الحوارُ يُغلَق بالنجاح وحده** — لا بالضغطة.
 *
 * كان زرُّ التأكيد `AlertDialogAction`، وهو يغلق الحوار من تلقائه لحظةَ النقر، فتُعرض
 * رسالةُ الرفض (`state.error`) داخل حوارٍ اختفى. مقيسٌ حيّاً ١٨ سبتمبر ٢٠٢٦ على الطلب
 * T-08 بسببٍ من حرفين: الفعلُ رفض، والطلبُ بقي `PAID`، والحوار انغلق بلا كلمة — فيقرأ
 * الموظّف الصمتَ نجاحاً ويظنّ المالَ خارجاً من الإيراد وهو فيه.
 */
export function RefundOrderButton({ orderId, amountLabel, buyerName }: { orderId: string; amountLabel: string; buyerName: string }) {
  const [state, action, pending] = useActionState(refundOrderAction, null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
            {state?.error && (
              <p role="alert" className="mb-2 rounded-md bg-destructive/10 px-2.5 py-2 text-[12px] text-destructive">
                {state.error}
              </p>
            )}
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              سبب الاسترداد
              <Input name="reason" required minLength={3} maxLength={300} placeholder="مثال: ألغى الاشتراك في أوّل أسبوع" />
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>إلغاء</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending && <Loader2 className="me-2 size-4 animate-spin" aria-hidden />}
              تأكيد الاسترداد
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
