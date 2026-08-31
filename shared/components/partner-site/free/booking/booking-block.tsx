import type { ReactNode } from "react";

import { WhatsAppButton } from "../../parts/whatsapp-button";
import { Section } from "../home/parts/section";
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
  if (b.mode === "NONE") return null;
  const label = b.label || "احجز الآن";
  const field = "h-11 w-full rounded-full border bg-background px-5 text-sm";

  return (
    <Section id="book" eyebrow="نردّ في نفس اليوم" heading={label} tone="muted">
      <div className="mx-auto max-w-2xl rounded-lg bg-background p-6 ring-1 ring-border">
        {b.mode === "LINK" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">تفتح صفحة الحجز الخاصّة بـ{data.name}.</p>
            <a
              href={preview ? undefined : (b.url ?? undefined)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground"
            >
              {label}
            </a>
          </div>
        ) : (
          form ?? (
            <div className="grid gap-3 sm:grid-cols-2" aria-hidden>
              <span className={`${field} flex items-center text-muted-foreground`}>اسمك</span>
              <span className={`${field} flex items-center text-muted-foreground`} dir="ltr">05X XXX XXXX</span>
              <span className="flex h-24 w-full items-start rounded-lg border bg-background px-5 py-3 text-sm text-muted-foreground sm:col-span-2">ملاحظة (اختياري)</span>
              <span className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground sm:col-span-2 sm:justify-self-start">{label}</span>
            </div>
          )
        )}
        {/* البديل يُعرض مرّة واحدة: النموذج الحيّ يحمل «أو كلّمه واتساب» بنفسه، فكان
            الزائر يقرأ العرض نفسه مرّتين على بُعد ٧٦px (مقيس ٣١ أغسطس). يبقى هنا حين لا
            يوجد نموذج حيّ — أي في المعاينة وفي وضع الرابط. */}
        {!form && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>أو</span>
            <WhatsAppButton href={data.whatsappHref} variant="text" />
          </div>
        )}
      </div>
    </Section>
  );
}
