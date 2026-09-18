"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createInvoiceFromOrderAction } from "../../../actions";

/**
 * المرحلةُ الأولى تُغلَق هنا: ما قُرئ في المعاينة يُكتب فاتورةً.
 *
 * الفعلُ يُعيد حساب الخطّة على الخادم قبل الكتابة، فلا تُمرَّر أرقامٌ من المتصفّح — لو
 * تغيّر الطلب أو أصدر زميلٌ فاتورةً بينهما، رُفض الإصدار برسالةٍ تقول السبب.
 */
export function IssueInvoiceButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1.5">
      {error ? <span className="text-[12px] text-destructive">{error}</span> : null}
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await createInvoiceFromOrderAction(orderId);
            // بعد الإصدار يعود للطلب: هناك أزرارُ الإرسال، وهي الخطوةُ التالية الوحيدة.
            if (r.ok) router.push(`/orders/${orderId}`);
            else setError(r.error);
          })
        }
      >
        {pending ? <Loader2 className="me-2 size-4 animate-spin" aria-hidden /> : <FilePlus2 className="me-2 size-4" aria-hidden />}
        إصدار الفاتورة
      </Button>
    </div>
  );
}
