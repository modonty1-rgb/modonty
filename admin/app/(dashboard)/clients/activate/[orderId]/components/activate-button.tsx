"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { activateFromOrder } from "@/lib/orders/activate-from-order";

/**
 * **ضغطةٌ واحدة — ولا حقلَ يُملأ.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «الصفحة تبعت التفعيل نخلّيها صفحة عرض بس، وأيّ تعديل يتمّ في
 * صفحة التعديل — حتى السلَج».
 *
 * فما يُكتب كلُّه مقروءٌ من الطلب: الاسمُ والبريدُ والجوالُ والدولةُ والحصّة، والسلَجُ
 * مؤقّتٌ من رقم الطلب. وموظّفُ التفعيل لا يعرف العميل، فكلُّ حقلٍ يُسأل عنه تخمينٌ
 * يُكتب في القاعدة ويُقرأ بعدها حقيقةً.
 *
 * ولا تأكيدَ بنافذة: الصفحةُ نفسُها هي التأكيد — تعرض الصفقةَ وبياناتِ المشتري كاملةً،
 * والزرُّ في آخرها بعد أن تُقرأ.
 */
export function ActivateButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    start(async () => {
      const res = await activateFromOrder({ orderId });
      if (!res.ok) {
        setError(res.error);
        toast({ variant: "destructive", title: "لم يُفعَّل", description: res.error });
        return;
      }
      toast({
        title: "فُتح الملفّ",
        description: "أكمل بياناته ثمّ جهّز دخولَه وأرسل بيانات الدخول من هذه الصفحة.",
      });
      // إلى صفحة العميل مباشرةً: التفاصيلُ الباقية (الصناعة · السلَج · YMYL) تُكمَّل هناك.
      router.push(`/clients/${res.clientId}/edit`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
          {error}
        </p>
      )}
      <Button onClick={run} disabled={pending} size="lg" className="w-full gap-2 sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UserCheck className="size-4" aria-hidden />}
        {pending ? "جاري التفعيل…" : "تفعيل العميل"}
      </Button>
      <p className="text-[11px] text-muted-foreground">
        يُفتح الملفّ ببيانات الطلب فقط — بلا كلمة مرور وبلا بريد. والصناعةُ والسلَجُ
        وتصنيفُ YMYL وبياناتُ الدخول تُكمَّل من صفحة العميل بعدها.
      </p>
    </div>
  );
}
