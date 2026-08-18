import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «اترك رقمك» — the contact page's form: name · phone · message, one button.
 * Server-safe markup (no handlers); the site posts it to the booking endpoint, the
 * console preview keeps it inert. Same fields the partner's booking requests already use.
 */
export function LeadForm({ data, preview = false }: { data: HomeData; preview?: boolean }) {
  const field = "h-11 w-full rounded-full border bg-background px-5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <Section id="lead-form" eyebrow="اترك رقمك" heading="ونعاود الاتصال بك في نفس اليوم">
      <form action={preview ? "#" : "/api/booking"} method="post" className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="اسمك" autoComplete="name" className={field} />
        <input name="phone" required type="tel" inputMode="tel" dir="ltr" placeholder="05X XXX XXXX" autoComplete="tel" className={field} />
        <textarea name="message" rows={4} placeholder={`اكتب لـ${data.name} إيش تحتاج (اختياري)`} className="sm:col-span-2 w-full rounded-lg border bg-background px-5 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />
        <p className="text-xs text-muted-foreground sm:col-span-2">رقمك للتواصل فقط — بلا رسائل تسويقية.</p>
        <button type="submit" className="h-11 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground sm:col-span-2 sm:justify-self-start">اطلب اتصالاً</button>
      </form>
    </Section>
  );
}
