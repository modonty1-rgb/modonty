"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { issueAndSendInvoiceAction } from "../../../actions";

/**
 * المرحلةُ الثانية: الإرسال — بأثرٍ غير مُسقِط. الفاتورةُ صدرت في القاعدة، وفشلُ البريد
 * لا يُلغيها؛ يُقال للموظّف ويُعاد الإرسال من هنا نفسه.
 */
export function SendInvoiceButton({ orderId, resend }: { orderId: string; resend: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1.5">
      {error ? <span className="text-[12px] text-destructive">{error}</span> : null}
      <Button
        type="button"
        variant={resend ? "outline" : "default"}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await issueAndSendInvoiceAction(orderId);
            if (r.ok) router.refresh();
            else setError(r.error ?? "فشل الإرسال");
          })
        }
      >
        {pending ? <Loader2 className="me-2 size-4 animate-spin" aria-hidden /> : <Mail className="me-2 size-4" aria-hidden />}
        {resend ? "إعادة الإرسال بالإيميل" : "تأكيد الإرسال بالإيميل"}
      </Button>
    </div>
  );
}
