import { SiteLink } from "../../parts/site-link";
import type { ReactNode } from "react";

import { WhatsAppButton } from "../../parts/whatsapp-button";
import { Section } from "../home/parts/section";
import { bookingLabel } from "./booking-label";
import type { HomeData } from "../home/home-data";

interface BookingBlockProps {
  data: HomeData;
  preview?: boolean;
  /**
   * The live form (modonty passes its BookingForm, which owns the server action).
   * Omitted in the console → an inert look-alike is drawn so the partner sees the shape.
   */
  form?: ReactNode;
}

/**
 * «احجز» — the admin's request button as a block: FORM → the booking form in a card
 * (name · phone · note → the button text the admin chose) · LINK → one big button to his
 * URL. Lives on the booking page and, as a CTA, after the services on the home page —
 * the pattern booking-led sites use (a page to link to + a block that catches intent).
 * Nothing renders when the admin set no button.
 */
export function BookingBlock({ data, preview = false, form }: BookingBlockProps) {
  const b = data.booking;
  if (b.mode === "NONE" || (b.mode === "LINK" && !b.url)) return null;
  // The line under the heading says what the button actually does (4 Oct 2026): it said
  // «تفتح صفحة الحجز» even when the admin's button was a WhatsApp chat.
  const url = b.url ?? "";
  const isWa = /wa\.me|whatsapp\.com/i.test(url);
  const linkLine = isWa
    ? `تفتح محادثة واتساب مع ${data.name}.`
    : url.startsWith("tel:")
      ? `تتّصل بـ${data.name} مباشرة.`
      : `تفتح صفحة ${data.name} على موقعه.`;
  const label = bookingLabel(b);
  // The heading repeated the button word for word («احجز الآن» over «احجز الآن»). It now says
  // what happens; the button keeps the admin's verb.
  // Short: the partner's name made it three lines on a phone («اترك طلبك لتجريبي – عيادة…»).
  const heading = b.mode === "FORM" ? "اترك طلبك" : `ابدأ مع ${data.name}`;
  const field = "h-11 w-full rounded-full border bg-background px-5 text-sm";

  return (
    <Section id="book" eyebrow="نردّ عليك بأقرب وقت" heading={heading} tone="muted">
      {/* The live form brings its own card — wrapping it drew a card inside a card (review, 4 Oct 2026). */}
      <div className={form ? "mx-auto max-w-2xl" : "mx-auto max-w-2xl rounded-[var(--ps-radius-card,0.5rem)] bg-background p-6 ring-1 ring-border"}>
        {b.mode === "LINK" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">{linkLine}</p>
            <SiteLink
              href={preview ? undefined : (b.url ?? undefined)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-[var(--ps-radius-control,9999px)] bg-primary px-8 text-sm font-bold text-primary-foreground"
            >
              {label}
            </SiteLink>
          </div>
        ) : (
          form ?? (
            <div className="grid gap-3 sm:grid-cols-2" aria-hidden>
              <span className={`${field} flex items-center text-muted-foreground`}>اسمك</span>
              <span className={`${field} flex items-center text-muted-foreground`}>رقم جوّالك</span>
              <span className="flex h-24 w-full items-start rounded-[var(--ps-radius-card,0.5rem)] border bg-background px-5 py-3 text-sm text-muted-foreground sm:col-span-2">ملاحظة (اختياري)</span>
              <span className="inline-flex h-11 items-center rounded-[var(--ps-radius-control,9999px)] bg-primary px-6 text-sm font-bold text-primary-foreground sm:col-span-2 sm:justify-self-start">{label}</span>
            </div>
          )
        )}
        {/* البديل يُعرض مرّة واحدة: النموذج الحيّ يحمل «أو كلّمه واتساب» بنفسه، فكان
            الزائر يقرأ العرض نفسه مرّتين على بُعد ٧٦px (مقيس ٣١ أغسطس). يبقى هنا حين لا
            يوجد نموذج حيّ — أي في المعاينة وفي وضع الرابط. */}
        {!form && !(b.mode === "LINK" && isWa) && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>أو</span>
            <WhatsAppButton href={data.whatsappHref} variant="text" />
          </div>
        )}
      </div>
    </Section>
  );
}
