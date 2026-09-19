"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, XCircle } from "lucide-react";

import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cancelOrderAction } from "../actions/cancel-order";

/**
 * إلغاءُ طلبٍ لم يصل فيه مال — يطلب سبباً **ورقمَ الطلب مكتوباً باليد**.
 *
 * خالد (٢٠ سبتمبر ٢٠٢٦): «اعمل عليها التأكيد بحيث إنّه يدخل رقم الأوردر أو آخر أربع
 * أرقام». والفرقُ ليس شكليّاً: حوارٌ يُغلق بضغطةٍ واحدة يُضغط سهواً بالتمرير أو
 * بالإنتر، وحوارٌ يطلب نسخَ رقمٍ من الشاشة لا يُغلق إلّا بقصد.
 *
 * ورقمُ الطلب **يُعرض في الحوار** لا يُطلب من الذاكرة: الحمايةُ من السهو لا من النسيان،
 * وإخفاؤه يحوّل الحارسَ إلى امتحان.
 *
 * **والحوارُ يُغلَق بالنجاح وحده** — لا بالضغطة (نفسُ علّة `refund-order-button.tsx`:
 * زرُّ `AlertDialogAction` يغلق الحوار لحظةَ النقر، فتُعرض رسالةُ الرفض في حوارٍ اختفى،
 * فيقرأ الموظّفُ الصمتَ نجاحاً).
 */
export function CancelOrderButton({
  orderId,
  orderNumber,
  buyerName,
}: {
  orderId: string;
  orderNumber: string;
  buyerName: string;
}) {
  const [state, action, pending] = useActionState(cancelOrderAction, null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  const last4 = orderNumber.replace(/\D/g, "").slice(-4);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-[12px] text-destructive hover:text-destructive">
          <XCircle className="size-4" aria-hidden />
          إلغاء الطلب
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <form action={action}>
          <input type="hidden" name="orderId" value={orderId} />
          <AlertDialogHeader>
            <AlertDialogTitle>إلغاء الطلب {orderNumber} لـ«{buyerName}»؟</AlertDialogTitle>
            <AlertDialogDescription>
              يصير «ملغى» ويسقط من الطابور. ولا يُمسّ شيءٌ آخر: لا فاتورةَ ولا حساب عميل.
              ولا يُلغى ما وصل فيه مال — لذاك بابُ الاسترداد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-3">
            {state?.error && (
              <p role="alert" className="rounded-md bg-destructive/10 px-2.5 py-2 text-[12px] text-destructive">
                {state.error}
              </p>
            )}
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              سبب الإلغاء
              <Input name="reason" required minLength={3} maxLength={300} placeholder="مثال: زائرٌ فتح الصفحة ولم يُكمل" />
            </label>
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
              تأكيد الإلغاء
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
