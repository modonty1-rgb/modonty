"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Clock } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import { cn } from "@/lib/utils";
import type { FailureReason } from "@/lib/checkout/resolve-checkout-reason";
import { CardField, type NGeniusHandle } from "../card-field/CardField";
import { composeSaPhone } from "../../helpers/compose-sa-phone";
import { modontyUrl } from "@/lib/modonty-url";

/**
 * نموذج الدفع — منقول من جبر سيو `_components/CheckoutForm.tsx` بكل ما تعلّمه هناك من
 * إخفاقات حقيقية، وموصولٌ بمسارنا وأنواع سجلّنا.
 *
 * جوهره أنه لا يخمّن نتيجةً أبداً: كل مسارٍ ينتهي إمّا برسالة صادقة أو بإحالةٍ إلى
 * `processing` حيث السيرفر يسأل المزوّد. مشترٍ أمام شاشة دفعٍ لا يُقال له «بنكك رفض»
 * ونحن لا نعلم.
 */

/** تسجيل إخفاقٍ بلا انتظار → `/api/checkout/log-failure`. `keepalive` كي يصل ولو غادرت
 *  الصفحة في اللحظة نفسها. لا يرمي أبداً: التسجيل لا يكسر الدفع. */
function logCheckoutFailure(payload: Record<string, unknown>): void {
  try {
    fetch("/api/checkout/log-failure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => { /* التسجيل لا يعطّل الدفع */ });
  } catch { /* ignore */ }
}

/** يرفض بعد `ms` كي يظهر وعدٌ معلَّق من الـSDK خطأً بدل دوّارةٍ أبدية — سلوكٌ رُصد فعلاً
 *  مع بطاقات أجنبية عند التوكنة. */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("__timeout__")), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

/** يستخرج رمزاً ورسالةً مما يرميه الـSDK. هو يرمي كائناً غنيّاً (`errors` متداخلة ·
 *  `code` · جسم HTTP)، و`.message` وحده يضيّع ذلك كلّه ويُقرأ «Error» فقط. */
function describeError(e: unknown): { code: string; message: string } {
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    const nested = (o.errors as unknown[] | undefined)?.[0] as Record<string, unknown> | undefined;
    const rawCode =
      o.code ?? o.errorCode ?? o.status ?? nested?.code ?? nested?.errorCode ?? (o as { name?: string }).name ?? "sdk_error";
    let message = String(o.message ?? nested?.message ?? "");
    try {
      const full = JSON.stringify(e, Object.getOwnPropertyNames(e as object));
      if (full && full !== "{}") message = (message ? message + " | " : "") + full;
    } catch { /* دائريّ أو غير قابل للتسلسل */ }
    return { code: String(rawCode).slice(0, 80), message: message.slice(0, 500) };
  }
  return { code: "sdk_error", message: String(e).slice(0, 500) };
}

type Props = {
  market: "SA";
  planSlug: string;
  planName: string;
  paidMonths: number;
  totalDisplay: string;
  /** يُملأ عند العودة من محاولة فاشلة — يرسم شريطاً داخل الصفحة. */
  paymentError?: FailureReason | null;
  /** رقم المحاولة (يبدأ من ١) — يظهر في الشريط. */
  attemptNumber?: number;
  turnstileSiteKey: string;
  ngeniusHostedSessionKey: string;
  ngeniusOutletRef: string;
};

type Errors = Partial<Record<"name" | "email" | "phone" | "terms" | "turnstile" | "card" | "submit", string>>;

export function CheckoutForm({
  market, planSlug, planName, paidMonths, totalDisplay,
  paymentError, attemptNumber, turnstileSiteKey,
  ngeniusHostedSessionKey, ngeniusOutletRef,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const ngeniusRef = useRef<NGeniusHandle | null>(null);

  // بعض مفاتيح Cloudflare الاختبارية لا تُطلق `onSuccess` بثبات، فنقرأ الحقل المخفيّ
  // الذي تحقنه الودجة. رخيصٌ وآمن، ويتوقّف أثره فور ضبط الحالة.
  useEffect(() => {
    if (turnstileToken) return;
    const tick = () => {
      const input = document.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');
      const v = input?.value;
      if (v && v.length > 5) setTurnstileToken(v);
    };
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [turnstileToken]);

  const backTo = (query: string) => `/${market.toLowerCase()}/checkout?${query}`;
  const logCtx = {
    provider: "NGENIUS" as const,
    planSlug,
    paidMonths,
    market,
    email: email || undefined,
  };

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "يرجى إدخال اسمك";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "يرجى إدخال بريد إلكتروني صالح";
    // نفس ما يفرضه `toE164` على السيرفر: جوّال سعودي من تسعة أرقام يبدأ بـ٥.
    const local = phone.replace(/[\s-]/g, "").replace(/^(\+?966|0)/, "");
    if (!/^5\d{8}$/.test(local)) next.phone = "يرجى إدخال رقم جوال سعودي (مثال: 5XXXXXXXX)";
    // الموافقة حارسٌ لا تلميح: كانت تُحسب في `canSubmit` وتُستعمل لسطر السبب وحده،
    // فيمرّ الدفع والخانة فارغة (قاسه خالد على المتصفّح). والعقد يُبرَم بالدفع نفسه
    // (بند ١١ من نموذج العقد)، فدفعةٌ بلا موافقة تُنشئ التزاماً بلا قبول شروطه.
    if (!termsAccepted) next.terms = "وافق على الشروط والأحكام قبل الدفع";
    return next;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const next = validate();
    if (!turnstileToken && turnstileSiteKey) next.turnstile = "يرجى إكمال التحقق الأمني قبل الدفع";
    if (!ngeniusRef.current?.isCardValid()) next.card = "أدخل بيانات البطاقة كاملة قبل الدفع";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      // ضغطةٌ لا تُحدث شيئاً مرئيّاً سببها هذا الفرع غالباً (حقول البطاقة ناقصة).
      logCheckoutFailure({ ...logCtx, stage: "validate", outcome: "failed", reasonCode: Object.keys(next).join(",").slice(0, 80) });
      const firstField = Object.keys(next).find((k) => !["turnstile", "card", "submit"].includes(k));
      if (firstField) document.getElementById(`checkout-${firstField}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      // ١ · جلسةٌ من الـSDK مباشرةً مع المزوّد. بمهلة ٨ ثوانٍ: بعض البطاقات الأجنبية
      //     تجعله يعلّق بلا ردّ، فتصير المهلة إخفاقاً مسجَّلاً ورسالةً صادقة بدل زرٍّ ميّت.
      let sessionId: string;
      try {
        sessionId = await withTimeout(ngeniusRef.current!.generateSessionId(), 8000);
      } catch (sErr) {
        const timedOut = sErr instanceof Error && sErr.message === "__timeout__";
        const desc = timedOut ? { code: "session_timeout", message: "8s timeout — SDK never responded" } : describeError(sErr);
        logCheckoutFailure({
          ...logCtx, stage: "session", outcome: timedOut ? "timeout" : "error",
          reasonCode: desc.code, message: desc.message,
        });
        setErrors((prev) => ({
          ...prev,
          submit: timedOut
            ? "تعذّر بدء الدفع — قد لا تدعم بطاقتك الدفع بعملة الموقع. جرّب بطاقة أخرى."
            : "تعذّر بدء الدفع. تأكد من بيانات البطاقة أو جرّب بطاقة أخرى.",
        }));
        return;
      }

      // ٢ · كل شيء إلى السيرفر: يتحقّق من Turnstile، ويبني السعر من الكتالوج، وينشئ الطلب.
      const res = await fetch("/api/checkout/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          turnstileToken: turnstileToken ?? "",
          // تُرسَل ويفرضها السيرفر: حارس المتصفّح وحده يُتجاوَز بطلبٍ مباشر.
          termsAccepted,
          name,
          email,
          // يُضمّ «+966» هنا: الحقل يعرضه لاصقاً ولا يكتبه المشتري.
          phone: composeSaPhone(phone),
          businessName: businessName.trim() || undefined,
          planSlug,
          paidMonths,
          market,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const code = (body?.error as string) || `HTTP ${res.status}`;
        logCheckoutFailure({ ...logCtx, stage: "create_order", outcome: "error", reasonCode: code.slice(0, 80), message: `create-payment ${res.status}` });
        const reasonSlug =
          code === "bot-check-failed" ? "authentication_failed"
          : code === "rate-limited" ? "timeout"
          : "system_error";
        const nextAttempt = (attemptNumber ?? 0) + 1;
        router.replace(backTo(`plan=${planSlug}&months=${paidMonths}&error=${reasonSlug}&attempt=${nextAttempt}`));
        return;
      }

      const paymentResponse = await res.json();
      const orderId = paymentResponse.orderId as string;

      // ٢ب · رفضٌ فوريّ أكّده السيرفر. الطلب ميّتٌ أصلاً، وتسليمه للـSDK يُبقي إطار البطاقة
      //      على «قيد المعالجة» إلى الأبد لأن وعده لا يُحلّ. نتخطّاه إلى نموذج بطاقة جديد.
      if (paymentResponse.declined) {
        logCheckoutFailure({ ...logCtx, stage: "auth", outcome: "declined", reasonCode: (paymentResponse.reason as string) || "declined" });
        const nextAttempt = (attemptNumber ?? 0) + 1;
        router.replace(backTo(`plan=${planSlug}&months=${paidMonths}&error=${paymentResponse.reason || "card_declined"}&attempt=${nextAttempt}&order=${orderId}`));
        return;
      }

      // ٣ · الـSDK يتولّى الردّ (ويفتح التحقّق الثنائي عند الحاجة). بمهلةٍ سخيّة: لو علّق
      //     بلا حلّ، نسقط إلى `processing` حيث **السيرفر** يسأل المزوّد عن الحقيقة.
      //     خمس دقائق أبعد من أي إدخال OTP حقيقي (رمز البنك ينتهي قبلها).
      let result: Awaited<ReturnType<NGeniusHandle["handlePaymentResponse"]>>;
      try {
        result = await withTimeout(ngeniusRef.current!.handlePaymentResponse(paymentResponse), 300_000);
      } catch (hErr) {
        const timedOut = hErr instanceof Error && hErr.message === "__timeout__";
        const desc = timedOut ? { code: "3ds_timeout", message: "5min timeout — SDK never resolved" } : describeError(hErr);
        logCheckoutFailure({ ...logCtx, stage: "three_ds", outcome: timedOut ? "timeout" : "error", reasonCode: desc.code, message: desc.message });
        // لا نخمّن النتيجة — السيرفر هو المصدر.
        router.replace(`/${market.toLowerCase()}/checkout/processing?order=${encodeURIComponent(orderId)}`);
        return;
      }

      if (result.success) {
        router.replace(`/${market.toLowerCase()}/checkout/processing?order=${orderId}`);
      } else {
        // الـSDK يطوي «ألغى المستخدم» داخل `status:"ERROR"` (مثبَّت في مصدره:
        // `includes("CANCELED") ? {status: ERROR}`)، فالمتصفّح **لا يستطيع** التمييز بين
        // إلغاءٍ ورفض. المؤكَّد هنا إخفاق التحقّق الثنائي وحده؛ وما عداه يأخذ رسالةً
        // محايدةً صادقة — لا يُقال لمشترٍ «بنكك رفض بطاقتك» ونحن لا نعلم.
        const reason = result.is3DsFailure ? "authentication_failed" : "system_error";
        logCheckoutFailure({
          ...logCtx,
          stage: result.is3DsFailure ? "three_ds" : "auth",
          outcome: "failed",
          reasonCode: (result.status || reason).slice(0, 80),
          state: result.status,
        });
        // السبب الحقيقي يُستخرج من المزوّد على السيرفر ويُكتب في الشاشة التي يقرأها الفريق.
        fetch(`/api/checkout/status?order=${encodeURIComponent(orderId)}`, { keepalive: true }).catch(() => { /* أفضل جهد */ });
        const nextAttempt = (attemptNumber ?? 0) + 1;
        router.replace(backTo(`plan=${planSlug}&months=${paidMonths}&error=${reason}&attempt=${nextAttempt}&order=${orderId}`));
      }
    } catch (err) {
      const desc = describeError(err);
      logCheckoutFailure({ ...logCtx, stage: "create_order", outcome: "error", reasonCode: desc.code, message: desc.message });
      setErrors((prev) => ({ ...prev, submit: err instanceof Error ? err.message : "خطأ غير معروف" }));
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    !submitting && termsAccepted && (!turnstileSiteKey || !!turnstileToken)
    && name.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0;

  // لماذا الزرّ غير جاهز — يُقال تحته صراحةً، فلا يبقى زرٌّ رماديّ لا يعرف المشتري سببه.
  const disabledReason = submitting
    ? null
    : name.trim().length === 0 || email.trim().length === 0 || phone.trim().length === 0
      ? "أكمل بياناتك (الاسم · البريد · الجوال) للمتابعة"
      : !termsAccepted
        ? "وافق على الشروط والأحكام للمتابعة"
        : turnstileSiteKey && !turnstileToken
          ? "أكمل التحقق الأمني بالأعلى قبل الدفع"
          : null;

  const fieldClass = (bad: boolean) =>
    cn(
      "h-12 w-full rounded-lg border bg-background px-3.5 text-base text-foreground shadow-none outline-none transition placeholder:text-muted-foreground/70",
      bad ? "border-destructive focus:ring-2 focus:ring-destructive/25" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/15",
    );

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      {paymentError && (
        <div role="alert" aria-live="polite" className="flex items-start gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3.5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive-ink" strokeWidth={2.5} />
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-sm font-bold text-destructive-ink">
              {paymentError.title}
              {attemptNumber && attemptNumber > 1 && (
                <span className="ms-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-semibold" dir="ltr">
                  محاولة #{attemptNumber}
                </span>
              )}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {paymentError.hint} — <strong className="text-foreground">لم يُخصم أي مبلغ.</strong>
            </p>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="checkout-name" className="mb-1.5 block text-[13px] font-semibold text-foreground">الاسم</label>
        <input
          id="checkout-name" name="name" type="text" autoComplete="name" required maxLength={100}
          value={name}
          onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
          placeholder="محمد العمري"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "err-name" : undefined}
          className={fieldClass(!!errors.name)}
        />
        {errors.name && <p id="err-name" className="mt-1 text-xs text-destructive-ink">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="checkout-email" className="mb-1.5 block text-[13px] font-semibold text-foreground">البريد الإلكتروني</label>
        <input
          id="checkout-email" name="email" type="email" autoComplete="email" required maxLength={254}
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
          placeholder="you@company.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "err-email" : undefined}
          className={fieldClass(!!errors.email)}
        />
        {errors.email && <p id="err-email" className="mt-1 text-xs text-destructive-ink">{errors.email}</p>}
        <p className="mt-1.5 text-xs text-muted-foreground">هذا البريد يستقبل رابط الدخول وفاتورتك من مدونتي.</p>
      </div>

      <div>
        <label htmlFor="checkout-phone" className="mb-1.5 block text-[13px] font-semibold text-foreground">رقم الجوال</label>
        <div
          className={cn(
            "flex h-12 w-full items-stretch overflow-hidden rounded-lg border bg-background transition",
            errors.phone
              ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/25"
              : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
          )}
        >
          <input
            id="checkout-phone" name="phone" type="tel" autoComplete="tel" inputMode="numeric" required
            value={phone}
            onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: undefined })); }}
            placeholder="5XXXXXXXX"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "err-phone" : undefined}
            className="flex-1 border-0 bg-transparent px-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <span className="inline-flex items-center border-s border-border bg-muted px-3 text-xs font-semibold text-muted-foreground" dir="ltr">
            +966
          </span>
        </div>
        {errors.phone && <p id="err-phone" className="mt-1 text-xs text-destructive-ink">{errors.phone}</p>}
      </div>

      {/* اسم النشاط اختياريّ عمداً: هو ما يظهر على الفاتورة وفي صفحة العميل، لكن اشتراطه
          يوقف مشترياً يريد الدفع الآن ويسمّي نشاطه لاحقاً. */}
      <div>
        <label htmlFor="checkout-business" className="mb-1.5 block text-[13px] font-semibold text-foreground">
          اسم النشاط <span className="font-normal text-muted-foreground">— اختياري</span>
        </label>
        <input
          id="checkout-business" name="businessName" type="text" maxLength={120}
          /* `organization` — WCAG 1.3.5 (AA) يفرض أن يكون غرض الحقل مُدرَكاً برمجيّاً،
             والثلاثة الأخرى تحمله (`name` · `email` · `tel`) وهذا وحده كان بلا قيمة.
             وثمرته عمليّة: المتصفّح يملؤه من بطاقة المستخدم بلا كتابة على الجوّال. */
          autoComplete="organization"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="عيادة النور"
          className={fieldClass(false)}
        />
      </div>

      <CardField ref={ngeniusRef} apiKey={ngeniusHostedSessionKey} outletRef={ngeniusOutletRef} language="ar" />
      {errors.card && <p className="text-xs text-destructive-ink">{errors.card}</p>}

      {/* Turnstile في وضعه المُدار (مرئيّ). الوضع الخفيّ أخفق صامتاً على أجهزة وشبكات
          بعينها (سفاري iPad ومزوّدين محدَّدين): لا رمز يصدر أبداً، فيبقى زرّ الدفع معطّلاً
          بلا طريقة لإكمال الفحص. والودجة المرئية تُعطي كل مستخدمٍ تحدّياً يستطيع إتمامه.
          وبلا مفتاح موقع لا تُرسم أصلاً — فالساندبوكس يعمل قبل وصول المفاتيح. */}
      {turnstileSiteKey ? (
        <>
          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              options={{ theme: "auto", language: "ar", size: "flexible", action: "checkout" }}
              onSuccess={(token) => { setTurnstileToken(token); setErrors((prev) => ({ ...prev, turnstile: undefined })); }}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />
          </div>
          {errors.turnstile && <p className="text-center text-xs text-destructive-ink">{errors.turnstile}</p>}
        </>
      ) : null}

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          aria-invalid={!!errors.terms}
          aria-describedby={errors.terms ? "checkout-terms-error" : undefined}
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          // مربّع الموافقة: `size-5` و`shrink-0` معاً. قيس على ٣٩٠px فكان **١٣×١٦** في
          // صفحة التقسيط — انضغط عرضُه لأنه في صفّ مرن بلا `shrink-0`، فصار هدفاً
          // مشوَّهاً أصغر من حدّ WCAG 2.5.8 (٢٤×٢٤). و`size-6` = ٢٤px بالضبط — كان `size-5`
          // (٢٠px) وقيس على ٣٩٠px فرسب. والنصّ المجاور داخل `<label>` فالنقر عليه يبدّله،
          // لكن المربّع نفسه يجب أن يُصاب بالإصبع لا بالحظّ.
          className="mt-0.5 size-6 shrink-0 accent-primary"
        />
        <span>
          أوافق على <a href={modontyUrl("/terms")} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">الشروط والأحكام</a>
          {" و "}
          <a href={modontyUrl("/terms")} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">سياسة الاسترداد والإلغاء</a>.
        </span>
      </label>

      {errors.terms && (
        <p id="checkout-terms-error" role="alert" className="text-xs font-semibold text-destructive-ink">{errors.terms}</p>
      )}

      {/* يُسأل عنه قبل الدفع لا بعده: من يتردّد يريد أن يقرأ ما يلتزم به، والعقد
          مولَّد من هذه الباقة بعينها لا نموذجاً عامّاً. */}
      <a
        href={`/${market.toLowerCase()}/contract?plan=${planSlug}&months=${paidMonths}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex h-11 items-center gap-1.5 text-[13px] font-semibold text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        اطّلع على نموذج العقد
      </a>

      {/* لا زرّ إرسالٍ معطَّل صامتاً (قاعدة Baymard): الزرّ يبقى قابلاً للضغط — يُعطَّل أثناء
          المعالجة وحدها — وكل ضغطةٍ تُشغّل التحقّق وتُظهر سبباً محدَّداً. */}
      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "flex h-14 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-black transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          submitting
            ? "cursor-wait bg-muted text-muted-foreground"
            : "bg-foreground text-background shadow-[0_14px_30px_-14px_color-mix(in_oklch,var(--foreground)_45%,transparent)] hover:bg-foreground/90 active:scale-[0.99]",
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>جاري معالجة الدفع…</span>
          </>
        ) : (
          <>
            <span>ادفع الآن</span>
            {/* الفاصل عنصرٌ مستقلّ لا جزءٌ من المبلغ، ولا `dir="ltr"` على المبلغ:
                `Intl` يُخرج «ـ٪٣٢٠ ر.س.ـ» محفوفاً بـRLM من الطرفين، فإقحام «·» داخل نفس
                المدى المقلوب يرميه إلى طرف الزرّ البعيد بدل أن يفصل (قياس حيّ: «ادفع الآن· ٪٧١٩٤ ر.س.»). */}
            <span aria-hidden className="opacity-45">·</span>
            <span>{totalDisplay}</span>
          </>
        )}
      </button>

      {!canSubmit && disabledReason && (
        <p className="text-center text-xs text-muted-foreground" aria-live="polite">{disabledReason}</p>
      )}

      {errors.submit && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive-ink">{errors.submit}</p>
      )}

      <div className="flex items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-center text-xs text-foreground">
        <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
        <span>تسليم من ٧٢ ساعة إلى ١٤ يوم — لو تأخّرنا، نمدّد اشتراكك مجاناً</span>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        باقتك <strong className="font-semibold text-foreground">{planName}</strong> · معالجة الدفع بمعيار PCI DSS
      </p>
    </form>
  );
}
