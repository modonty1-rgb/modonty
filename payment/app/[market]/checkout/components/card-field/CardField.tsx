"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { CreditCard, AlertCircle, ShieldCheck, Lock, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { payMarkAsset } from "@modonty/shared/lib/commercial/pay-mark-names";

/**
 * حقل البطاقة من N-Genius (Hosted Session) — منقول من جبر سيو
 * `app/[country]/checkout/_components/CardField.tsx` بكل حراساته.
 *
 * معزولٌ في ملفّه لأن الـSDK يكتب على `window` ويحقن `iframe`؛ خلطه بالنموذج يجعل كل
 * إعادة رسمٍ في النموذج خطراً على إطار البطاقة.
 *
 * التوثيق: https://docs.ngenius-payments.com/docs/web-sdk-integration-guide
 */

/**
 * العلامات المقبولة على هذا الحقل — وهي حقيقة تقنية عن بوّابة البطاقة لا خيار تسويق،
 * فتبقى في الكود. Apple Pay غائبة عمداً: هذا حقل إدخال بطاقة ولا تمرّ منه أبداً، وعرض
 * شعارها هنا يعد بزرٍّ لا وجود له — يكتشفه المشتري بعد أن يكون قد قرّر استعماله.
 */
const BRANDS = (["mada", "visa", "mastercard"] as const).map(payMarkAsset);

type NGeniusSDK = {
  mountCardInput: (mountId: string, opts: {
    apiKey: string;
    outletRef: string;
    language?: string;
    style?: Record<string, unknown>;
    showInputsLabel?: boolean;
    firstName?: string;
    lastName?: string;
    onSuccess?: () => void;
    onFail?: (err: unknown) => void;
    onChangeValidStatus?: (v: {
      isCVVValid: boolean;
      isExpiryValid: boolean;
      isNameValid: boolean;
      isPanValid: boolean;
    }) => void;
  }) => void;
  unMountCardInputs: () => void;
  generateSessionId: () => Promise<{ session_id: string }>;
  handlePaymentResponse: (
    response: unknown,
    opts?: { mountId: string; style: { width: number; height: number } },
  ) => Promise<{ status: string; error?: unknown }>;
  paymentStates: {
    AUTHORISED: string;
    CAPTURED: string;
    PURCHASED: string;
    FAILED: string;
    THREE_DS_FAILURE: string;
  };
};

declare global {
  interface Window {
    NI?: NGeniusSDK;
  }
}

const SDK_SRC = process.env.NEXT_PUBLIC_NGENIUS_SDK_URL
  ?? "https://paypage.sandbox.ksa.ngenius-payments.com/hosted-sessions/sdk.js";

const MOUNT_ID = "ngenius-card-mount";
const THREE_DS_MOUNT_ID = "ngenius-3ds-mount";

export type NGeniusHandle = {
  generateSessionId(): Promise<string>;
  handlePaymentResponse(response: unknown): Promise<{ status: string; success: boolean; is3DsFailure: boolean }>;
  isReady(): boolean;
  isCardValid(): boolean;
};

type Props = {
  apiKey: string;
  outletRef: string;
  language?: "ar" | "en";
};

export const CardField = forwardRef<NGeniusHandle, Props>(function CardField(
  { apiKey, outletRef, language = "ar" },
  ref,
) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardValid, setCardValid] = useState(false);
  // يتحوّل حين يفتح الـSDK تحدّي التحقّق الثنائي: تُخفى حقول البطاقة ويُبدَّل العنوان إلى
  // «التحقّق من بنكك»، كي لا يرى المشتري سطحَي دفعٍ في وقتٍ واحد.
  const [in3DS, setIn3DS] = useState(false);
  const readyRef = useRef(false);
  const cardValidRef = useRef(false);
  // حارسٌ من التأثير المزدوج في وضع React الصارم (تطوير): يعمل التأثير ← ينظّف ← يعيد
  // العمل فوراً، فيكدّس الـSDK إطاراً ثانياً فوق الأول بلا هذا الحارس.
  const mountedRef = useRef(false);

  useEffect(() => { readyRef.current = ready; }, [ready]);
  useEffect(() => { cardValidRef.current = cardValid; }, [cardValid]);

  useImperativeHandle(ref, () => ({
    isReady: () => readyRef.current,
    isCardValid: () => cardValidRef.current,
    async generateSessionId() {
      if (!window.NI) throw new Error("N-Genius SDK not loaded");
      const { session_id } = await window.NI.generateSessionId();
      return session_id;
    },
    async handlePaymentResponse(response) {
      if (!window.NI) throw new Error("N-Genius SDK not loaded");
      setIn3DS(true);
      const width = Math.min(window.innerWidth - 40, 500);
      let result;
      try {
        result = await window.NI.handlePaymentResponse(response, {
          mountId: THREE_DS_MOUNT_ID,
          style: { width, height: 620 },
        });
      } finally {
        setIn3DS(false);
      }
      const status = String(result.status ?? "");
      const s = window.NI.paymentStates;
      const success = status === s.AUTHORISED || status === s.CAPTURED || status === s.PURCHASED;
      const is3DsFailure = status === s.THREE_DS_FAILURE;
      return { status, success, is3DsFailure };
    },
  }), []);

  useEffect(() => {
    if (!apiKey || !outletRef) {
      setError("مفاتيح N-Genius غير مكتملة");
      return;
    }

    const existing = document.querySelector(`script[data-ngenius-sdk="1"]`);
    let script: HTMLScriptElement;

    function mount() {
      if (!window.NI?.mountCardInput) {
        setError("SDK loaded but window.NI.mountCardInput missing");
        return;
      }
      if (mountedRef.current) return;
      const container = document.getElementById(MOUNT_ID);
      if (container) container.innerHTML = "";
      mountedRef.current = true;
      try {
        // `firstName` لا يُمرَّر عمداً: تمريره يجعل الـSDK يملأ خانة اسم حامل البطاقة
        // ويقفلها — صحيحٌ حين يكون المشترك هو حامل البطاقة، وخاطئٌ في الحالة الشائعة:
        // بطاقة زوج أو قريب أو جهة عمل. اسم المشترك يصلنا من حقل النموذج بوصفه صاحب
        // الحساب، واسم حامل البطاقة يذهب إلى N-Genius وحده بوصفه من صرّح بهذه الدفعة.
        window.NI.mountCardInput(MOUNT_ID, {
          apiKey,
          outletRef,
          language,
          style: {
            main: { width: "100%", minWidth: "260px", minHeight: "520px", overflow: "visible", boxSizing: "border-box" },
            base: { fontFamily: "inherit", color: "#0a0a0a" },
            // ١٦px يمنع تكبير سفاري iOS التلقائي عند التركيز، والارتفاع يجعل كل خانة
            // قابلةً للّمس — افتراضي الـSDK صفٌّ ضيّق.
            input: {
              padding: "12px 14px",
              fontSize: "16px",
              height: "44px",
              borderRadius: "10px",
              borderColor: "#e5e5e5",
              borderStyle: "solid",
              borderWidth: "1px",
              backgroundColor: "#ffffff",
            },
            invalid: { color: "#ef4444", borderColor: "#ef4444" },
          },
          showInputsLabel: true,
          onSuccess: () => {
            setReady(true);
            // الـSDK يثبّت ارتفاع الإطار عند ١٥٠px مهما كان حجم الحاضن — ومستنده الداخلي
            // أطول، فيسقط صفّ اسم حامل البطاقة تحت الحافة ويصير غير مرئيّ. العنصر الخارجي
            // من أصلنا فنملك تنسيقه.
            const iframe = document.querySelector<HTMLIFrameElement>(`#${MOUNT_ID} iframe`);
            if (!iframe) return;
            const isNarrow = window.matchMedia("(max-width: 480px)").matches;
            iframe.style.height = isNarrow ? "320px" : "220px";
          },
          onFail: (err) => {
            setError(String((err as { message?: string })?.message ?? err));
            setReady(false);
          },
          onChangeValidStatus: (v) => {
            setCardValid(v.isCVVValid && v.isExpiryValid && v.isNameValid && v.isPanValid);
          },
        });
      } catch (e) {
        setError(String((e as { message?: string })?.message ?? e));
      }
    }

    if (existing) {
      if (window.NI) mount();
      else existing.addEventListener("load", mount, { once: true });
    } else {
      script = document.createElement("script");
      script.src = SDK_SRC;
      script.async = true;
      script.dataset.ngeniusSdk = "1";
      script.onload = mount;
      script.onerror = () => setError("فشل تحميل بوابة الدفع");
      document.body.appendChild(script);
    }

    return () => {
      try { window.NI?.unMountCardInputs?.(); } catch { /* ignore */ }
      const container = document.getElementById(MOUNT_ID);
      if (container) container.innerHTML = "";
      mountedRef.current = false;
    };
  }, [apiKey, outletRef, language]);

  return (
    /**
     * لوحٌ فاتح داخل الصفحة عمداً — «حدّ الثقة» الذي تستعمله Stripe وApple Pay وShopify.
     *
     * ⚠ **الاستثناء الوحيد من توكنات المنصّة في مسار البيع كلّه، ومقصود.**
     * الـSDK يرسم حقول البطاقة داخل `iframe` من نطاق المزوّد، ومتغيّرات CSS **لا تعبر**
     * حدود المصدر — فحقوله بيضاء دائماً ولا نملك تنسيقها. ولو أخذ هذا اللوح توكنات
     * المنصّة لانقلب داكناً في الوضع الداكن وبقيت الحقول بيضاء داخله: لوحٌ أسود بفتحةٍ
     * بيضاء في وسطه. فبدل مصارعة الإطار نبني حوله سطحاً ثابت الفتحة يحتضنه.
     *
     * ولهذا كل ألوان هذه الكتلة حرفية (`neutral` · `emerald` · هيكس داخل `style`): هي
     * تُطابق ما يرسمه المزوّد لا ما ترسمه مدونتي. وما عدا هذا اللوح في الصفحة — العناوين
     * والأزرار والحقول والشارات — يقرأ التوكنات كبقيّة المنصّة.
     */
    <div className="rounded-2xl bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-12px_rgba(0,0,0,0.35)] ring-1 ring-neutral-200/80">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900/5 text-neutral-800">
          <CreditCard className="h-4 w-4" strokeWidth={2.25} />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-neutral-900">بيانات البطاقة</p>
          <p className="text-[10.5px] text-neutral-500">مشفّرة عبر بوابة N-Genius</p>
        </div>
        {!ready && !error && <span className="text-[10.5px] font-medium text-neutral-500">جاري التحميل…</span>}
        {ready && (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
            جاهز
          </span>
        )}
      </div>

      {/* الحاضن `relative` كي يجلس الهيكل العظمي فوق فتحة التركيب حتى يجهز الإطار —
          وهو مرسومٌ بشكل ما سيأتي (رقم بعرض كامل · انتهاء وCVV جنباً إلى جنب · اسم بعرض
          كامل) فلا تقفز الصفحة عند التبديل. */}
      <div className="relative">
        <div id={MOUNT_ID} dir="ltr" className="w-full overflow-hidden rounded-xl bg-white" style={{ minHeight: 220 }} />

        {!ready && !error && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col gap-3 rounded-xl bg-white p-5">
            <div className="h-11 w-full animate-pulse rounded-lg bg-neutral-300" />
            <div className="flex gap-3">
              <div className="h-11 flex-1 animate-pulse rounded-lg bg-neutral-300" />
              <div className="h-11 flex-1 animate-pulse rounded-lg bg-neutral-300" />
            </div>
            <div className="h-11 w-full animate-pulse rounded-lg bg-neutral-300" />
          </div>
        )}
      </div>

      {/* تحدّي التحقّق الثنائي — نافذةٌ مكتوبة بيدنا بمظهر `Dialog` بلا Radix. سبب تجنّبه
          عند جبر: `forceMount` يقفل الصفحة كلّها (`pointer-events: none`) ويبقى القفل حتى
          مع `open=false`، فتتجمّد كل حقول الدفع. هنا يبقى موضع التركيب في الشجرة دائماً
          (يحتاجه الـSDK بـ`getElementById`) ويُبدَّل الظهور على الغلاف وحده. */}
      <div
        role="dialog"
        aria-modal={in3DS}
        aria-labelledby="ngenius-3ds-title"
        aria-hidden={!in3DS}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm transition-opacity duration-200",
          in3DS ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          className={cn(
            "w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-transform duration-200 sm:max-w-lg",
            in3DS ? "scale-100" : "scale-95",
          )}
        >
          <div className="flex items-center gap-2.5 border-b border-border p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success-ink">
              <ShieldCheck className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <div className="flex-1 text-start">
              <p id="ngenius-3ds-title" className="text-[14px] font-bold leading-tight text-foreground">التحقّق من بنكك</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">أدخل رمز التحقق (OTP) لإتمام الدفع</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-success-ink">
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={3} />
              قيد التحقق
            </span>
          </div>
          <div id={THREE_DS_MOUNT_ID} style={{ height: 560 }} className="w-full overflow-hidden bg-white" />
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="mb-0.5 font-semibold">خطأ في بوابة الدفع</p>
            <p className="text-red-600/90">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col items-center gap-2 border-t border-neutral-200 pt-3">
        <div className="inline-flex items-center gap-2">
          {BRANDS.map((brand) => (
            <span
              key={brand.alt}
              className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-2 py-1.5"
              title={brand.alt}
              aria-label={brand.alt}
            >
              {/* `img` عاديّ لا `next/image`: ثلاثة SVG محلّية بلا تحسينٍ ممكن ولا قفزة
                  تخطيطٍ تُمنع — و`next/image` كان يطبع تحذيراً لكلٍّ منها في كل تحميل
                  لأن أبعاد مدى ٦٠×٢٠ تخالف المعلَن. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.src} alt={brand.alt} className="object-contain" style={{ height: 20, width: "auto" }} />
            </span>
          ))}
        </div>
        <div className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-neutral-600">
          <Lock className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
          <span>تشفير SSL 256-bit</span>
          <span className="text-neutral-500" aria-hidden>·</span>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
          <span>PCI DSS</span>
        </div>
      </div>
    </div>
  );
});
