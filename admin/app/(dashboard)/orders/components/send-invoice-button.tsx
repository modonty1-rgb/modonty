"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { sendInvoiceForOrderAction } from "../actions";

/**
 * إرسالُ الفاتورة — من صفحة الطلب، بعد أن تكون صدرت (خالد ١٨ سبتمبر ٢٠٢٦).
 *
 * صفحةُ الفاتورة تُصدر فقط؛ وما إن يوجد رقمٌ حتّى ينتقل الفعلُ إلى الطلب، حيث تجلس
 * قنوات التسليم كلُّها في صفٍّ واحد — بريدٌ وواتساب — فيبقى للموظّف مكانٌ واحد يتحكّم منه.
 *
 * وبأثرٍ غير مُسقِط: الفاتورةُ مكتوبةٌ في القاعدة، وفشلُ البريد لا يُلغيها — يُقال له ويُعاد.
 */
export function SendInvoiceButton({ orderId, resend }: { orderId: string; resend: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="flex items-center gap-2">
      {error ? <span className="text-[11px] text-destructive">{error}</span> : null}
      <Button
        type="button"
        size="sm"
        variant={resend ? "outline" : "default"}
        className="h-8 gap-1.5 px-2.5 text-[12px]"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await sendInvoiceForOrderAction(orderId);
            if (r.ok) router.refresh();
            else setError(r.error ?? "فشل الإرسال");
          })
        }
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Mail className="size-4" aria-hidden />}
        {resend ? "إعادة إرسال الفاتورة" : "إرسال الفاتورة بالإيميل"}
      </Button>
    </span>
  );
}
