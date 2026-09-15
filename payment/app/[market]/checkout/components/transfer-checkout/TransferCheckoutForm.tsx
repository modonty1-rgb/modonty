"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

import { cn } from "@/lib/utils";
import { modontyUrl } from "@/lib/modonty-url";

import { composeMarketPhone } from "../../helpers/compose-market-phone";

/**
 * فورم الطلب المصريّ — يسجّل الطلب، ولا يدفع.
 *
 * ── ليش البيانات قبل بيانات الحساب ──
 * الترتيب المقلوب (الحساب أوّلاً) يخسر الاثنين: من يحوّل تصل حوالته بلا اسمٍ يُطابَق
 * به، ومن لا يحوّل يمضي ولا يبقى منه رقمٌ يُتابَع. فحين يُضغط الزرّ يوجد **صفٌّ في
 * القاعدة** له رقم — وهو ما يُكتب في خانة بيان الحوالة، وبه وحده تُربط بصاحبها.
 *
 * ── والحقول نفسها لا مشابهةً لها ──
 * نفس أسماء `CheckoutForm` و`autoComplete` ومقاسات الأهداف، ونفس `toE164` على السيرفر
 * (`shared/lib/phone.ts:24` يعرف `01…` المصريّ كما يعرف `05…` السعوديّ). واختلاف حقلٍ
 * واحدٍ بين مسارين يعني عطلاً يُصلَح في أحدهما ويبقى في الآخر.
 */

type Props = {
  planSlug: string;
  planName: string;
  paidMonths: number;
  totalDisplay: string;
  turnstileSiteKey: string;
  marketSlug: string;
};

type Errors = Partial<Record<"name" | "email" | "phone" | "terms" | "turnstile" | "submit", string>>;

export function TransferCheckoutForm({
  planSlug,
  planName,
  paidMonths,
  totalDisplay,
  turnstileSiteKey,
  marketSlug,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const fieldClass = (bad: boolean) =>
    cn(
      "h-12 w-full rounded-lg border bg-background px-3.5 text-base text-foreground shadow-none outline-none transition placeholder:text-muted-foreground/70",
      bad
        ? "border-destructive focus:ring-2 focus:ring-destructive/25"
        : "border-border focus:border-primary focus:ring-2 focus:ring-primary/15",
    );

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "اكتب اسمك";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) next.email = "بريد إلكتروني غير صالح";
    // التطبيع النهائي على السيرفر؛ وهذا فحصٌ مبكرٌ يوفّر رحلة شبكة.
    const local = phone.replace(/[\s-]/g, "").replace(/^(\+?20|0)/, "");
    if (!/^1\d{9}$/.test(local)) next.phone = "يرجى إدخال رقم موبايل مصري (مثال: 1XXXXXXXXX)";
    if (!termsAccepted) next.terms = "وافق على الشروط والأحكام قبل تسجيل الطلب";
    if (turnstileSiteKey && !turnstileToken) next.turnstile = "أكمل التحقق الأمني بالأعلى";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // التركيز إلى أوّل حقلٍ خاطئ: رسالةٌ أسفل الصفحة لا يراها من يقف في أعلاها.
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      first?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/checkout/bank-transfer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: composeMarketPhone(phone, "EG"),
          businessName: businessName.trim() || undefined,
          planSlug,
          paidMonths,
          market: "EG",
          termsAccepted: true,
          turnstileToken: turnstileToken ?? "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { orderId?: string; error?: string };
      if (!res.ok || !data.orderId) {
        /** سببٌ مفهوم لا رمزٌ خام: «rate-limited» لا تعني للمشتري شيئاً. */
        const reason =
          data.error === "rate-limited"
            ? "محاولات كثيرة خلال دقيقة — انتظر قليلاً ثم أعد المحاولة."
            : data.error === "bot-check-failed"
              ? "لم يكتمل التحقق الأمني — حدّث الصفحة وأعد المحاولة."
              : data.error === "plan-not-found" || data.error === "term-not-found"
                ? "الباقة لم تعد متاحة — اختر باقة أخرى."
                : "تعذّر تسجيل طلبك الآن. أعد المحاولة أو تواصل معنا على واتساب.";
        setErrors({ submit: reason });
        setTurnstileToken(null);
        setSubmitting(false);
        return;
      }
      /** `replace` لا `push`: الرجوع من صفحة التحويل يجب ألّا يعيد إرسال الفورم. */
      router.replace(`/${marketSlug}/checkout/transfer?order=${data.orderId}`);
    } catch {
      setErrors({ submit: "تعذّر الاتصال — تحقّق من شبكتك وأعد المحاولة." });
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      {/* ما سيحدث بعد الضغط، مكتوبٌ قبله: زرٌّ لا يُعرف أثره لا يُضغط. */}
      <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5">
        <p className="text-[13px] font-bold text-foreground">الدفع في مصر بالتحويل البنكي أو إنستا باي</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          سجّل بياناتك أولاً، ثم تظهر لك بيانات الحساب ورقم طلبك. حوّل المبلغ وأرسل صورة
          الإيصال على واتساب — ونفعّل اشتراكك خلال ٢٤ ساعة.
        </p>
      </div>

      {errors.submit && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3.5"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive-ink" strokeWidth={2.5} />
          <p className="text-sm font-bold text-destructive-ink">{errors.submit}</p>
        </div>
      )}

      <div>
        <label htmlFor="eg-name" className="mb-1.5 block text-[13px] font-semibold text-foreground">
          الاسم
        </label>
        <input
          id="eg-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={100}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          placeholder="محمد عبد الرحمن"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "err-eg-name" : undefined}
          className={fieldClass(!!errors.name)}
        />
        {errors.name && <p id="err-eg-name" className="mt-1 text-xs text-destructive-ink">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="eg-email" className="mb-1.5 block text-[13px] font-semibold text-foreground">
          البريد الإلكتروني
        </label>
        <input
          id="eg-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          placeholder="you@company.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "err-eg-email" : undefined}
          className={fieldClass(!!errors.email)}
        />
        {errors.email && <p id="err-eg-email" className="mt-1 text-xs text-destructive-ink">{errors.email}</p>}
        <p className="mt-1.5 text-xs text-muted-foreground">هذا البريد يستقبل رابط الدخول وفاتورتك من مدونتي.</p>
      </div>

      <div>
        <label htmlFor="eg-phone" className="mb-1.5 block text-[13px] font-semibold text-foreground">
          رقم الموبايل
        </label>
        {/* نفس بنية الحقل المركّب في المسار السعوديّ: مؤشّر التركيز على الغلاف
            (`focus-within`) لأن `input` داخله بلا حدّ — قيس: ٣٫٨٤:١ داكناً و٦٫٣٢:١ فاتحاً. */}
        <div
          className={cn(
            "flex h-12 w-full items-stretch overflow-hidden rounded-lg border bg-background transition",
            errors.phone
              ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/25"
              : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
          )}
        >
          <input
            id="eg-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            required
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
            }}
            placeholder="1XXXXXXXXX"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "err-eg-phone" : undefined}
            className="flex-1 border-0 bg-transparent px-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <span
            className="inline-flex items-center border-s border-border bg-muted px-3 text-xs font-bold text-muted-foreground"
            dir="ltr"
          >
            +20
          </span>
        </div>
        {errors.phone && <p id="err-eg-phone" className="mt-1 text-xs text-destructive-ink">{errors.phone}</p>}
        <p className="mt-1.5 text-xs text-muted-foreground">نرسل عليه تأكيد الطلب، وعليه ترسل صورة الإيصال.</p>
      </div>

      <div>
        <label htmlFor="eg-business" className="mb-1.5 block text-[13px] font-semibold text-foreground">
          اسم النشاط — اختياري
        </label>
        <input
          id="eg-business"
          name="businessName"
          type="text"
          autoComplete="organization"
          maxLength={120}
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="اسم شركتك أو متجرك"
          className={fieldClass(false)}
        />
      </div>

      {turnstileSiteKey ? (
        <>
          <div className="flex justify-center">
            {/* نفس إعدادات المسار السعوديّ: الوضع المُدار (مرئيّ) لا الخفيّ — الخفيّ
                أخفق صامتاً على أجهزةٍ وشبكاتٍ بعينها فلا يصدر رمزٌ أبداً ويبقى الزرّ
                معطّلاً بلا طريقةٍ لإتمام الفحص. وبلا مفتاح موقع لا تُرسم أصلاً. */}
            <Turnstile
              siteKey={turnstileSiteKey}
              options={{ theme: "auto", language: "ar", size: "flexible", action: "bank-transfer" }}
              onSuccess={(token) => {
                setTurnstileToken(token);
                setErrors((p) => ({ ...p, turnstile: undefined }));
              }}
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
          aria-describedby={errors.terms ? "eg-terms-error" : undefined}
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          /* `size-6` = ٢٤px بالضبط، و`shrink-0` كي لا ينضغط في الصفّ المرن — حدّ WCAG 2.5.8. */
          className="mt-0.5 size-6 shrink-0 accent-primary"
        />
        <span>
          أوافق على{" "}
          <a
            href={modontyUrl("/terms")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            الشروط والأحكام
          </a>
          {" و "}
          <a
            href={modontyUrl("/terms")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            سياسة الاسترداد والإلغاء
          </a>
          .
        </span>
      </label>

      {errors.terms && (
        <p id="eg-terms-error" role="alert" className="text-xs font-bold text-destructive-ink">
          {errors.terms}
        </p>
      )}

      <a
        href={`/${marketSlug}/contract?plan=${planSlug}&months=${paidMonths}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex h-11 items-center gap-1.5 text-[13px] font-bold text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        اطّلع على نموذج العقد
      </a>

      {/* «سجّل طلبك» لا «ادفع»: لا يُخصم شيءٌ هنا، ووعدٌ بالدفع في زرٍّ لا يدفع يُفقد الثقة
          في اللحظة التالية. والمبلغ معه لأنه ما سيُحوَّل. */}
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
            <span>جاري تسجيل طلبك…</span>
          </>
        ) : (
          <>
            <span>سجّل طلبك</span>
            {/* الفاصل عنصرٌ مستقلّ: `Intl` يحفّ المبلغ بعلامات RLM، فإقحام «·» داخل مداه
                يرميه إلى طرف الزرّ البعيد بدل أن يفصل. */}
            <span aria-hidden className="opacity-45">
              ·
            </span>
            <span>{totalDisplay}</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        لا يُخصم أي مبلغ الآن — التحويل بعد تسجيل الطلب، وباقتك «{planName}» محفوظة بسعرها.
      </p>
    </form>
  );
}
