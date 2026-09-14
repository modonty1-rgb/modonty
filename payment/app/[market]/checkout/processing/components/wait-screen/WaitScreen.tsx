"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * شاشة الانتظار — تسأل `/api/checkout/status` حتى يخرج الطلب من «بانتظار الدفع»، ثم تحوّل
 * إلى النجاح أو الفشل (منقولة من جبر سيو `WaitScreen.tsx`).
 *
 * وعند انتهاء المهلة **لا تُعلن فشلاً**: تقول إن التأكيد يطول وإن الإيميل سيصل، وتترك
 * المشتري بمخرج. إعلان الفشل هنا يدفع من دفع فعلاً إلى الدفع مرّةً ثانية.
 */

const POLL_INTERVAL_MS = 2_000;
// ٩٠ ثانية — تغطّي تأخّر الويبهوك الواقعي. كانت ٦٠ عند جبر فانتهت كثيراً على الساندبوكس
// حيث لا يكون الويبهوك مسموحاً بعد، فتُقذف الناس إلى الرسالة الاحتياطية قبل أوانها.
const POLL_TIMEOUT_MS = 90_000;

export function WaitScreen({
  marketSlug,
  order,
  refShort,
}: {
  marketSlug: string;
  order: string;
  refShort: string;
}) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const stopped = useRef(false);

  useEffect(() => {
    async function tick() {
      if (stopped.current) return;

      if (Date.now() - startedAt.current > POLL_TIMEOUT_MS) {
        setTimedOut(true);
        return;
      }

      try {
        const res = await fetch(`/api/checkout/status?order=${encodeURIComponent(order)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();

        if (data.status === "PAID") {
          stopped.current = true;
          router.replace(`/${marketSlug}/checkout/success?order=${encodeURIComponent(order)}`);
          return;
        }
        if (data.status === "FAILED" || data.status === "CANCELLED") {
          stopped.current = true;
          // المعرّف وحده — صفحة الفشل تقرأ السبب من القاعدة وتترجمه؛ وتمرير النصّ الخام
          // يكتب رسالة مزوّدٍ تقنية في شريط عنوان المشتري.
          router.replace(`/${marketSlug}/checkout/failed?order=${encodeURIComponent(order)}`);
          return;
        }
      } catch {
        // تعثّر شبكة لا يوقف الاستعلام — يُعاد بهدوء.
      }

      setAttempts((n) => n + 1);
      window.setTimeout(tick, POLL_INTERVAL_MS);
    }

    tick();
    return () => { stopped.current = true; };
  }, [marketSlug, order, router]);

  return (
    <main className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8" dir="rtl">
      <div className="text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 shadow-lg shadow-primary/20">
          <Loader2 className="h-11 w-11 animate-spin text-primary" strokeWidth={2.5} />
        </div>

        <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">
          {timedOut ? "لا زلنا نتحقق من دفعك" : "لحظات — نُجهّز حسابك"}
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {timedOut
            ? "التأكيد يستغرق وقتاً أطول من المعتاد. سيصلك إيميل من مدونتي فور اكتمال العملية. لا داعي لإعادة الدفع."
            : "تم إرسال طلب الدفع للبنك. ننتظر التأكيد الآن — يستغرق عادة ٥-١٥ ثانية."}
        </p>

        <div className="mt-8 inline-flex items-baseline gap-2 text-xs text-muted-foreground" dir="ltr">
          <span>Order:</span>
          <span className="text-foreground">{refShort}</span>
        </div>

        {!timedOut && (
          <p className="mt-6 text-xs text-muted-foreground/80">لا تُغلق هذه الصفحة — نُحوّلك تلقائياً بمجرد التأكيد.</p>
        )}

        {timedOut && (
          <div className="mt-8 space-y-3">
            <p className="text-xs text-muted-foreground">يمكنك متابعة حسابك من:</p>
            <a
              href="https://console.modonty.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-primary/90"
            >
              افتح console.modonty.com ↗
            </a>
          </div>
        )}

        <p className="mt-10 text-[11px] text-muted-foreground/60" dir="ltr">
          {timedOut ? `timeout after ${Math.floor(POLL_TIMEOUT_MS / 1000)}s` : `attempt ${attempts + 1}`}
        </p>
      </div>
    </main>
  );
}
