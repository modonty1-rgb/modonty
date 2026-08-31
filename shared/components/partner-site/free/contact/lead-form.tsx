"use client";

import { useState } from "react";

import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «اترك رقمك» — استمارة صفحة تواصل معنا: اسم · جوّال · رسالة، وزرّ واحد.
 *
 * كانت `<form method="post">` عادية تُرسل إلى `/api/booking` — ومسارٌ لم يكن موجوداً
 * أصلاً (٤٠٤ مقيسة)، فرقم الزائر يضيع وهو ينتقل إلى صفحة خطأ. صارت ترسل بجافاسكربت
 * إلى المسار الذي أُنشئ لها، وتعرض نتيجتها في مكانها: خطأ يُقرأ والحقول محفوظة، أو
 * تأكيدٌ يقول ماذا يحصل بعده.
 */
export function LeadForm({ data, preview = false }: { data: HomeData; preview?: boolean }) {
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
          clientId: data.clientId,
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
      else setError(json?.error || "تعذّر إرسال طلبك، حاول مرة ثانية.");
    } catch {
      setError("ما وصل الطلب — تأكّد من اتصالك وحاول مرة ثانية.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <Section id="lead-form" eyebrow="اترك رقمك" heading="وصلنا طلبك">
        <p className="mx-auto max-w-2xl text-center text-sm text-muted-foreground">
          {data.name} بيتواصل معك على الرقم اللي كتبته في نفس اليوم.
        </p>
      </Section>
    );
  }

  return (
    <Section id="lead-form" eyebrow="اترك رقمك" heading="ونعاود الاتصال بك في نفس اليوم">
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
          placeholder="05X XXX XXXX"
          autoComplete="tel"
          className={field}
        />

        <label className="sr-only" htmlFor="lead-message">إيش تحتاج</label>
        <textarea
          id="lead-message"
          name="message"
          rows={4}
          placeholder={`اكتب لـ${data.name} إيش تحتاج (اختياري)`}
          className="sm:col-span-2 w-full rounded-lg border bg-background px-5 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />

        {/* النشاط الحسّاس: الخادم يرفض الطلب بلا هذا الإقرار، فلا يجوز أن يغيب عن الشاشة. */}
        {data.isYmyl && (
          <label className="sm:col-span-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <input type="checkbox" name="disclaimer" required className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              أوافق على أن هذا الطلب للتواصل فقط، وما هو استشارة ولا بديل عن زيارة مختصّ.
            </span>
          </label>
        )}

        <p className="text-xs text-muted-foreground sm:col-span-2">
          رقمك للتواصل فقط — بلا رسائل تسويقية.
        </p>

        {error && (
          <p
            role="alert"
            className="sm:col-span-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="h-11 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
        >
          {sending ? "نرسل طلبك…" : "اطلب اتصالاً"}
        </button>
      </form>
    </Section>
  );
}
