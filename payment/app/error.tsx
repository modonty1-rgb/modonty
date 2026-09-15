"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * حدّ الخطأ لمسار الدفع كلّه.
 *
 * لماذا وُجد (مراجعة ١٤ سبتمبر ٢٠٢٦): لم يكن في التطبيق `error.tsx` ولا
 * `global-error.tsx` — فأيّ استثناء غير ملتقَط يرسم شاشة Next الافتراضية: إنجليزية،
 * LTR، بلا شعار، وفي الإنتاج بلا سبب. وهذه أسوأ شاشةٍ يمكن أن يراها من أدخل بطاقته
 * قبل ثانية: لا يعرف أهو دفع أم لا، ولا إلى أين يذهب.
 *
 * وأخطر ما فيها الصمت: زائرٌ يرى خطأً بعد الدفع سيفترض أن ماله ذهب، فيتصل أو يعيد
 * المحاولة — والثانية أسوأ لأنها دفعةٌ ثانية. فالنصّ هنا يقول صراحةً إن المبلغ إن خُصم
 * فالطلب مسجَّل، ويعطيه طريق التواصل.
 *
 * `reset` من Next يعيد رسم المقطع بلا إعادة تحميل الصفحة — فمن كان يملأ نموذجاً لا
 * يفقده لو كان الخطأ عابراً.
 */
export default function PayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // السجلّ للفريق لا للزائر: الرسالة الخام قد تحمل تفاصيل بوّابةٍ لا تُعرض.
    console.error("[pay] unhandled error:", error);
  }, [error]);

  const waNumber = process.env.NEXT_PUBLIC_SALES_WHATSAPP?.replace(/\D/g, "") ?? "";
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `مرحباً، واجهتني مشكلة في صفحة الدفع${error.digest ? ` (رمز: ${error.digest})` : ""}`,
      )}`
    : null;

  return (
    <main
      className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center"
      dir="rtl"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="size-7 text-destructive-ink" strokeWidth={2.25} aria-hidden />
      </div>

      <h1 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">تعذّر عرض الصفحة</h1>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        حدث خلل مؤقّت عندنا، لا في بطاقتك.
        <strong className="mt-1 block font-semibold text-foreground">
          إن كان المبلغ قد خُصم فطلبك مسجَّل عندنا ولن يتكرّر الخصم — لا تُعد الدفع.
        </strong>
      </p>

      <div className="mt-8 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-[15px] font-bold text-background transition-colors hover:bg-foreground/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <RefreshCw className="size-[17px]" strokeWidth={2.5} aria-hidden />
          حاول مرّة أخرى
        </button>

        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-foreground/25 bg-secondary px-6 text-[15px] font-bold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            تواصل معنا
          </a>
        ) : null}
      </div>

      {/* `digest` هو الجسر الوحيد بين ما رآه الزائر وما في سجلّنا — في الإنتاج لا تصل
          الرسالة الخام إلى المتصفّح، وهذا الرمز يصل. فيُعرض كي يذكره حين يتواصل. */}
      {error.digest ? (
        <p className="mt-6 text-[11px] text-muted-foreground/70" dir="ltr">
          {error.digest}
        </p>
      ) : null}
    </main>
  );
}
