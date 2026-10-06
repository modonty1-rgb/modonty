"use client";

import { useState } from "react";

import { Section } from "../home/parts/section";

/**
 * «اترك رقمك» — استمارة صفحة تواصل معنا: اسم · جوّال · رسالة، وزرّ واحد.
 *
 * كانت `<form method="post">` عادية تُرسل إلى `/api/booking` — ومسارٌ لم يكن موجوداً
 * أصلاً (٤٠٤ مقيسة)، فرقم الزائر يضيع وهو ينتقل إلى صفحة خطأ. صارت ترسل بجافاسكربت
 * إلى المسار الذي أُنشئ لها، وتعرض نتيجتها في مكانها: خطأ يُقرأ والحقول محفوظة، أو
 * تأكيدٌ يقول ماذا يحصل بعده.
 */
/** Only what the form needs — the registry block passed the whole page data, which a client
 *  component ships to the browser in full (every post, question and photo; 4 Oct 2026). */
export interface LeadFormIslandProps {
  clientId: string;
  name: string;
  isYmyl: boolean;
  preview?: boolean;
}

export function LeadFormIsland({ clientId, name, isYmyl, preview = false }: LeadFormIslandProps) {
  const field =
    "h-11 w-full rounded-full border bg-background px-5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (preview) return;
    const form = new FormData(e.currentTarget);
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          message: String(form.get("message") ?? ""),
          disclaimerAccepted: form.get("disclaimer") === "on",
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { success: boolean; error?: string }
        | null;
      if (json?.success) setDone(true);
      else setError(json?.error || "تعذّر إرسال طلبك، حاول مرة أخرى.");
    } catch {
      setError("لم يصل الطلب — تأكّد من اتصالك وحاول مرة أخرى.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <Section id="lead-form" eyebrow="اترك رقمك" heading="وصلنا طلبك">
        <p className="mx-auto max-w-2xl text-center text-sm text-muted-foreground">
          سيتواصل معك {name} على الرقم الذي كتبته بأقرب وقت.
        </p>
      </Section>
    );
  }

  return (
    <Section id="lead-form" eyebrow="اترك رقمك" heading="ونعاود الاتصال بك بأقرب وقت">
      <form onSubmit={submit} className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
        {/* تسمية مقروءة لقارئ الشاشة بلا تغيير الشكل — النائب وحده لا يُنطَق كتسمية. */}
        <label className="sr-only" htmlFor="lead-name">اسمك</label>
        <input id="lead-name" name="name" required placeholder="اسمك" autoComplete="name" className={field} />

        <label className="sr-only" htmlFor="lead-phone">رقم جوّالك</label>
        <input
          id="lead-phone"
          name="phone"
          required
          type="tel"
          inputMode="tel"
          dir="ltr"
          // «05X» is a Saudi number — wrong for a visitor in Egypt (4 Oct 2026). The words fit any
          // country; the digits the visitor types stay LTR.
          placeholder="رقم جوّالك"
          autoComplete="tel"
          className={`${field} placeholder:text-right`}
        />

        <label className="sr-only" htmlFor="lead-message">ماذا تحتاج؟</label>
        <textarea
          id="lead-message"
          name="message"
          rows={4}
          placeholder={`اكتب لـ${name} ما تحتاجه (اختياري)`}
          className="sm:col-span-2 w-full rounded-[var(--ps-radius-card,0.5rem)] border bg-background px-5 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />

        {/* النشاط الحسّاس: الخادم يرفض الطلب بلا هذا الإقرار، فلا يجوز أن يغيب عن الشاشة. */}
        {isYmyl && (
          <label className="sm:col-span-2 flex items-start gap-2 text-sm leading-relaxed md:text-xs text-muted-foreground">
            <input type="checkbox" name="disclaimer" required className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              أوافق على أن هذا الطلب للتواصل فقط، وما هو استشارة ولا بديل عن زيارة مختصّ.
            </span>
          </label>
        )}

        <p className="text-sm text-muted-foreground md:text-xs sm:col-span-2">
          رقمك للتواصل فقط — بلا رسائل تسويقية.
        </p>

        {error && (
          <p
            role="alert"
            className="sm:col-span-2 rounded-[var(--ps-radius-card,0.5rem)] border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="h-11 rounded-[var(--ps-radius-control,9999px)] bg-primary px-6 text-sm font-bold text-primary-foreground disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
        >
          {sending ? "نرسل طلبك…" : "اطلب اتصالاً"}
        </button>
      </form>
    </Section>
  );
}
