"use client";

import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { IconPhone, IconEmail, IconWebsite } from "@/lib/icons";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { recordWhatsappLead } from "@/app/articles/[slug]/actions/booking-actions";

import { BookingCtaLink } from "@/components/booking-cta-link";

interface ClientContactSheetProps {
  clientId: string;
  clientName: string;
  clientSlug: string;
  phone: string | null;
  email: string | null;
  /** Admin-configured primary action — rendered at the TOP of the sheet. */
  ctaMode: "FORM" | "LINK" | "NONE";
  linkUrl: string | null;
  ctaLabel: string | null;
  /** The button that opens the sheet (rendered via asChild). */
  children: ReactNode;
}

/**
 * The client's action sheet (opened by tapping the bottom-bar logo). It leads with
 * the admin-configured PRIMARY CTA — booking form (FORM) or external link (LINK) —
 * then offers the always-available contact channels (WhatsApp · call · email). NONE
 * clients show contact only. Mirrors the article dock's logo sheet.
 */
export function ClientContactSheet({
  clientId,
  clientName,
  clientSlug,
  phone,
  email,
  ctaMode,
  linkUrl,
  ctaLabel,
  children,
}: ClientContactSheetProps) {
  const hasBooking = ctaMode === "FORM";
  const hasLink = ctaMode === "LINK" && !!linkUrl;
  const hasCta = hasBooking || hasLink;
  const hasContact = !!phone || !!email;
  const linkLabel = ctaLabel?.trim() || "تسوّق الآن";

  const row =
    "flex items-center gap-3 rounded-xl border p-3.5 transition-colors active:scale-[0.99]";

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl p-0">
        <div className="max-h-[85vh] overflow-y-auto p-5 pb-7">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden />

          <SheetHeader className="space-y-1 text-start">
            <SheetTitle className="text-[16px] font-extrabold text-foreground">
              {hasBooking ? `احجز موعدك مع ${clientName}` : `تواصل مع ${clientName}`}
            </SheetTitle>
            <SheetDescription className="text-[12.5px] text-muted-foreground">
              {hasCta ? "ابدأ بالإجراء التالي، أو تواصل مباشرة" : "اختر الطريقة الأنسب لك"}
            </SheetDescription>
          </SheetHeader>

          {/* Primary CTA — booking page link / external link */}
          {hasBooking && (
            <div className="mt-4">
              <BookingCtaLink
                clientSlug={clientSlug}
                source="client_page"
                label={ctaLabel}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
              />
            </div>
          )}

          {hasLink && (
            <div className="mt-4">
              <CtaTrackedLink
                href={linkUrl as string}
                label={linkLabel}
                type="BUTTON"
                clientId={clientId}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
              >
                <IconWebsite className="h-4 w-4" />
                {linkLabel}
              </CtaTrackedLink>
            </div>
          )}

          {/* Divider between the CTA and the direct contact channels */}
          {hasCta && hasContact && (
            <div className="my-4 flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              أو تواصل مباشرة
              <span className="h-px flex-1 bg-border" />
            </div>
          )}

          {/* Always-available contact channels */}
          {hasContact && (
            <div className={`flex flex-col gap-2.5 ${hasCta ? "" : "mt-4"}`}>
              {phone && (
                <CtaTrackedLink
                  href={getWhatsAppLink(phone)}
                  label="Contact sheet – WhatsApp"
                  type="LINK"
                  clientId={clientId}
                  onBeforeNavigate={() => void recordWhatsappLead({ clientId, source: "client_page" })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${row} border-success/30 bg-success/10 hover:bg-success/15`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-success/15 text-success">
                    <WhatsAppIcon size={20} />
                  </span>
                  <span className="min-w-0">
                    <b className="block text-[13.5px] font-bold text-foreground">واتساب</b>
                    <span className="block text-[11.5px] text-muted-foreground">رد سريع عبر المحادثة</span>
                  </span>
                </CtaTrackedLink>
              )}

              {phone && (
                <CtaTrackedLink
                  href={`tel:${phone}`}
                  label="Contact sheet – call"
                  type="LINK"
                  clientId={clientId}
                  className={`${row} hover:bg-muted`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
                    <IconPhone className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-[13.5px] font-bold text-foreground">اتصال هاتفي</b>
                    <span dir="ltr" className="block truncate text-[11.5px] text-muted-foreground">
                      {phone}
                    </span>
                  </span>
                </CtaTrackedLink>
              )}

              {email && (
                <CtaTrackedLink
                  href={`mailto:${email}`}
                  label="Contact sheet – email"
                  type="LINK"
                  clientId={clientId}
                  className={`${row} hover:bg-muted`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent-foreground">
                    <IconEmail className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-[13.5px] font-bold text-foreground">أرسل بريدًا</b>
                    <span className="block truncate text-[11.5px] text-muted-foreground">{email}</span>
                  </span>
                </CtaTrackedLink>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
