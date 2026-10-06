import { SiteLink } from "../../../parts/site-link";
import { WhatsAppButton } from "../../../parts/whatsapp-button";
import { bookingLabel } from "../../booking/booking-label";
import type { HomeData } from "../../home/home-data";

/**
 * The cover's buttons — one rule for every theme's hero (4 Oct 2026, extracted when the second
 * theme arrived). The admin's request button leads (FORM → his booking page, LINK → his link);
 * the second action is WhatsApp, or the phone when the main button already IS WhatsApp. Two
 * buttons, never three. Inert in the console preview.
 */
export function HeroActions({ data, preview = false, className }: { data: HomeData; preview?: boolean; className?: string }) {
  const b = data.booking;
  const mainHref = b.mode === "FORM" ? data.bookHref ?? null : b.mode === "LINK" ? b.url : null;
  const mainIsWa = /wa\.me|whatsapp\.com/i.test(mainHref ?? "");
  const hasMain = Boolean(mainHref);
  return (
    <div className={className ?? "flex shrink-0 flex-wrap items-center gap-3 pb-1"}>
      {hasMain && (
        <SiteLink
          href={preview ? undefined : mainHref!}
          {...(b.mode === "LINK" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="inline-flex h-10 items-center rounded-[var(--ps-radius-control,9999px)] bg-primary px-6 text-sm font-bold text-primary-foreground max-md:h-11"
        >
          {bookingLabel(b)}
        </SiteLink>
      )}
      {(!hasMain || !mainIsWa) && <WhatsAppButton href={data.whatsappHref} variant={hasMain ? "outline-light" : "solid"} className={hasMain ? "border-border text-foreground" : undefined} />}
      {(!hasMain || mainIsWa || !data.whatsappHref) && data.phone && (
        <SiteLink href={`tel:${data.phone}`} className="inline-flex h-10 items-center rounded-[var(--ps-radius-control,9999px)] border px-5 text-sm font-medium text-foreground max-md:h-11">
          اتصل بنا
        </SiteLink>
      )}
    </div>
  );
}
