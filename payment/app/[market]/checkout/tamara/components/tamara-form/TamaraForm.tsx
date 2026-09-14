"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { AlertCircle, Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

import { cn } from "@/lib/utils";
import { composeSaPhone } from "../../../helpers/compose-sa-phone";
import { modontyUrl } from "@/lib/modonty-url";

/**
 * نصف الشراء بالتقسيط (منقول من جبر سيو `TamaraForm.tsx`).
 *
 * نموذجٌ منفصلٌ عن نموذج البطاقة عمداً: تمارا لا ترى رقم بطاقةٍ هنا — يُسلَّم المشتري إلى
 * صفحاتها ويعود — فلا SDK دفعٍ في هذا الملفّ ولا تحقّق ثنائي ولا مصافحة جلسة ولا المهل
 * التي تحتاجها تلك. هذا الغياب هو سبب وجوده مستقلّاً بدل فرعٍ داخل نموذج البطاقة، وهو
 * الملفّ الذي يمرّ منه كل ريال في هذا الموقع.
 *
 * وحقول التواصل مكرَّرة لا مشتركة. تكلفةٌ حقيقية تُسمّى: تعديل تحقّقٍ يُكتب مرّتين. وثمنها
 * أن مسار البطاقة لا يُمسّ — وهو المقصود. فإن نما أحدهما حقلاً خامساً صار استخراج حزمة
 * حقولٍ مشتركة أرخص.
 */

type Errors = Partial<Record<"name" | "email" | "phone" | "terms" | "turnstile" | "submit", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function TamaraForm({
  planSlug,
  planName,
  paidMonths,
  totalDisplay,
  marketSlug,
  turnstileSiteKey,
}: {
  planSlug: string;
  planName: string;
  paidMonths: number;
  totalDisplay: string;
  marketSlug: string;
  turnstileSiteKey: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "اكتب اسمك";
    if (!email.trim()) next.email = "اكتب بريدك";
    else if (!EMAIL_RE.test(email.trim())) next.email = "البريد مو مضبوط";
    const local = phone.replace(/[\s-]/g, "").replace(/^(\+?966|0)/, "");
    if (!phone.trim()) next.phone = "اكتب رقم جوالك";
    else if (!/^5\d{8}$/.test(local)) next.phone = "رقم جوال سعودي (مثال: 5XXXXXXXX)";
    if (!termsAccepted) next.terms = "لازم توافق على الشروط";
    if (turnstileSiteKey && !turnstileToken) next.turnstile = "أكمل التحقق الأمني";
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = Object.keys(next).find((k) => !["terms", "turnstile", "submit"].includes(k));
      if (first) document.getElementById(`tamara-${first}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/tamara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnstileToken: turnstileToken ?? "",
          name: name.trim(),
          email: email.trim(),
          phone: composeSaPhone(phone),
          businessName: businessName.trim() || undefined,
          planSlug,
          paidMonths,
          market: marketSlug.toUpperCase(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // صياغة تمارا مكتوبةٌ لمطوّر؛ والمشتري يأخذ الشيء الوحيد الذي يستطيع فعله.
        // والرمز التفصيلي مسجَّلٌ عندنا أصلاً.
        setErrors({
          submit:
            body?.error === "rate-limited"
              ? "محاولات كثيرة بسرعة. انتظر دقيقة وجرّب."
              : body?.error === "bot-check-failed"
                ? "التحقق الأمني ما نجح. حدّث الصفحة وجرّب."
                : body?.error === "tamara-not-configured"
                  ? "التقسيط غير متاح حالياً. تقدر تكمّل بالبطاقة من الرابط تحت."
                  // رفضت تمارا هذا المشتري قبل أن نُنشئ شيئاً. الصياغة تقول **قرار مَن** هو
                  // وتشير إلى الباب الذي ما زال مفتوحاً — لأن فشلاً غامضاً يُقرأ عطلاً
                  // عندنا فيذهب المشتري بدل أن يذهب إلى نموذج البطاقة.
                  : body?.error === "tamara-not-eligible"
                    ? "تمارا ما وافقت على التقسيط لهذا الطلب. تقدر تكمّل بالبطاقة من الرابط تحت."
                    : "تعذّر فتح تمارا الآن. جرّب بعد شوي أو ادفع بالبطاقة.",
        });
        setSubmitting(false);
        return;
      }

      const { checkoutUrl } = (await res.json()) as { checkoutUrl?: string };
      if (!checkoutUrl) {
        setErrors({ submit: "تعذّر فتح تمارا الآن. جرّب بعد شوي أو ادفع بالبطاقة." });
        setSubmitting(false);
        return;
      }

      // انتقالٌ كامل لا `router.push`: الوجهة نطاق تمارا. و`submitting` يبقى صحيحاً كي لا
      // يُضغط الزرّ مرّتين والمتصفّح في طريقه للخروج.
      window.location.href = checkoutUrl;
    } catch {
      setErrors({ submit: "فيه مشكلة في الاتصال. تأكد من الشبكة وجرّب." });
      setSubmitting(false);
    }
  }

  const field = (hasError: boolean) =>
    cn(
      "h-12 w-full rounded-lg border bg-background px-3.5 text-base text-foreground outline-none transition placeholder:text-muted-foreground/70",
      hasError
        ? "border-destructive focus:ring-2 focus:ring-destructive/25"
        : "border-border focus:border-primary focus:ring-2 focus:ring-primary/15",
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <label htmlFor="tamara-name" className="mb-1.5 block text-sm font-semibold">الاسم</label>
        <input
          id="tamara-name" name="name" autoComplete="name" required maxLength={100}
          value={name}
          onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
          placeholder="اسمك الكامل"
          aria-invalid={!!errors.name}
          className={field(!!errors.name)}
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="tamara-email" className="mb-1.5 block text-sm font-semibold">البريد الإلكتروني</label>
        <input
          id="tamara-email" name="email" type="email" autoComplete="email" required dir="ltr" maxLength={254}
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          className={cn(field(!!errors.email), "text-start")}
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="tamara-phone" className="mb-1.5 block text-sm font-semibold">الجوال</label>
        <input
          id="tamara-phone" name="phone" type="tel" autoComplete="tel" inputMode="numeric" required
          value={phone}
          onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: undefined })); }}
          placeholder="05xxxxxxxx"
          aria-invalid={!!errors.phone}
          className={field(!!errors.phone)}
        />
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        {/* تمارا ترسل رمز التحقّق على هذا الرقم، فرقمٌ خاطئ طريقٌ مسدود لا غلطةٌ تُصحَّح
            لاحقاً داخل مسارها. */}
        <p className="mt-1 text-xs text-muted-foreground">تمارا بترسل لك رمز تحقق على هذا الرقم.</p>
      </div>

      <div>
        <label htmlFor="tamara-business" className="mb-1.5 block text-sm font-semibold">
          اسم النشاط <span className="font-normal text-muted-foreground">— اختياري</span>
        </label>
        <input
          id="tamara-business" name="businessName" maxLength={120}
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="عيادة النور"
          className={field(false)}
        />
      </div>

      {turnstileSiteKey ? (
        <>
          <div className="flex justify-center">
            <Turnstile
              siteKey={turnstileSiteKey}
              options={{ theme: "auto", language: "ar", size: "flexible", action: "checkout-tamara" }}
              onSuccess={(token) => { setTurnstileToken(token); setErrors((p) => ({ ...p, turnstile: undefined })); }}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />
          </div>
          {errors.turnstile && <p className="text-center text-xs text-destructive">{errors.turnstile}</p>}
        </>
      ) : null}

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => { setTermsAccepted(e.target.checked); if (errors.terms) setErrors((p) => ({ ...p, terms: undefined })); }}
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
          <a href={modontyUrl("/refund-policy")} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">سياسة الاسترداد</a>،
          وعلى شروط تمارا لخطة التقسيط.
        </span>
      </label>
      {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}

      {errors.submit && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{errors.submit}</span>
        </div>
      )}

      {/* قابلٌ للضغط ولو كان النموذج ناقصاً — زرٌّ معطَّل صامتاً يترك المشتري بلا وسيلةٍ
          ليعرف ما ينقصه. كل ضغطةٍ تُشغّل التحقّق وتشير إلى الحقل بعينه. */}
      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "flex h-14 w-full items-center justify-center gap-2.5 rounded-xl text-[15px] font-black transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          submitting ? "cursor-wait bg-muted text-muted-foreground" : "bg-foreground text-background hover:opacity-90",
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span>جاري التحويل لتمارا…</span>
          </>
        ) : (
          <>
            <span>أكمل مع</span>
            <span className="flex h-8 items-center justify-center rounded-md bg-white px-2 ring-1 ring-black/5">
              <Image src="/logos/tamara.svg" alt="تمارا" width={97} height={29} unoptimized style={{ height: 22, width: "auto" }} />
            </span>
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-muted-foreground">
        بتكمّل الدفع على صفحة تمارا، وترجع هنا بعد التأكيد. إجمالي {totalDisplay} لباقة {planName}.
      </p>
    </form>
  );
}
