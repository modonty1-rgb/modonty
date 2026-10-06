"use client";

import { useState } from "react";

import { Section } from "../home/parts/section";

/**
 * «النشرة» — one field + one button, centred (Tailwind "newsletter" / Shopify `newsletter`).
 *
 * It was a plain `<form method="post" action="/api/subscribe">` — a path that does not exist, so
 * every visitor who subscribed landed on a 404 and was never saved (4 Oct 2026, same fault the
 * lead form had). It now sends to modonty's per-partner endpoint `/api/subscribers` and shows
 * the result in place. Inert in the console preview.
 */
export function NewsletterIsland({ clientId, name, preview = false }: { clientId: string; name: string; preview?: boolean }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (preview) return;
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, clientId }),
      });
      const json = (await res.json().catch(() => null)) as { success: boolean } | null;
      if (json?.success) setDone(true);
      // The endpoint's own errors are English («Invalid request»); only its rate limit is Arabic.
      else setError(res.status === 429 ? "حاولت كثيراً — حاول مرة أخرى بعد قليل." : "تعذّر الاشتراك، تأكّد من البريد وحاول مرة أخرى.");
    } catch {
      setError("لم يصل الطلب — تأكّد من اتصالك وحاول مرة أخرى.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Section id="newsletter" tone="muted">
      <div className="mx-auto max-w-xl text-center">
        {/* No name in the heading — a long one ran three lines on a phone (4 Oct 2026). */}
        <h2 className="text-balance text-2xl font-bold leading-tight text-foreground">ابقَ على تواصل معنا</h2>
        {done ? (
          <p role="status" className="mt-4 text-base font-medium text-foreground">
            تم الاشتراك — سيصلك جديد {name} على بريدك.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">جديدنا ومقالاتنا على بريدك — بلا إزعاج، ويمكنك إلغاء الاشتراك متى شئت.</p>
            <form className="mt-6 flex gap-2" onSubmit={submit}>
              {/* The field had only a placeholder — gone the moment you type, and no name for a screen reader. */}
              <label className="sr-only" htmlFor="newsletter-email">بريدك الإلكتروني</label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                dir="ltr"
                placeholder="بريدك الإلكتروني"
                className="h-11 min-w-0 flex-1 rounded-[var(--ps-radius-control,9999px)] border bg-background px-5 text-sm outline-none ring-offset-background placeholder:text-right focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button type="submit" disabled={sending} className="h-11 shrink-0 rounded-[var(--ps-radius-control,9999px)] bg-primary px-6 text-sm font-bold text-primary-foreground disabled:opacity-60">
                {sending ? "نرسل…" : "اشترك"}
              </button>
            </form>
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          </>
        )}
      </div>
    </Section>
  );
}
