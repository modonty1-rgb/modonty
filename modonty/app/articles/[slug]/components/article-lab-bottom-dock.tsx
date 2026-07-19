"use client";

import type { ReactNode } from "react";
import NextImage from "next/image";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BookingForm } from "@/app/articles/[slug]/components/booking-form";
import { WhatsAppBookingCta } from "@/components/whatsapp-booking-cta";
import { WhatsAppLeadLink } from "@/components/whatsapp-icon-link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { bookingWhatsappMessage } from "@/lib/whatsapp";
import { BRAND_AVATAR_RADIUS } from "@/lib/brand-avatar";
import { IconClients, IconExternal, IconCalendar } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ArticleLabBottomDockProps {
  clientId: string | null;
  articleId: string;
  clientName: string;
  clientLogoUrl?: string | null;
  /** Client WhatsApp number (E.164). When present, the bar shows the WhatsApp button. */
  clientPhone?: string | null;
  /** Primary CTA config (admin-controlled): FORM → booking · LINK → external · NONE → info only. */
  cta: { mode: "NONE" | "FORM" | "LINK"; label?: string | null; url?: string | null };
  /** Session user (name + email) — prefills the booking form. */
  bookingUser: { name: string | null; email: string | null } | null;
  /** The server-rendered client card (its own CTA hidden) — shown in the info sheet. */
  clientCard: ReactNode;
}

/**
 * Mobile sticky CONVERSION bar: «احجز الآن» (opens the booking form) · «واتساب» (records a
 * deduped lead + attributed message) · client logo (opens the info card). Adapts to the
 * client type — FORM shows booking, LINK shows an external CTA, NONE shows info only; the
 * WhatsApp button appears only when the client has a number. Engagement (like/save/comment/
 * share) lives in the quiet top bar, not here — this bar is the single loud focal point.
 */
export function ArticleLabBottomDock({
  clientId,
  articleId,
  clientName,
  clientLogoUrl,
  clientPhone,
  cta,
  bookingUser,
  clientCard,
}: ArticleLabBottomDockProps) {
  const isForm = cta.mode === "FORM" && !!clientId;
  const isLink = cta.mode === "LINK" && !!cta.url;
  const bookLabel = cta.label?.trim() || "احجز الآن";
  const linkLabel = cta.label?.trim() || "تسوّق الآن";

  const pill =
    "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-opacity active:scale-[0.98]";

  // Booking block reused in the booking sheet AND the info sheet (repeat actions for consistency).
  const bookingBlock: ReactNode = isForm ? (
    <div className="space-y-4">
      {clientPhone && (
        <>
          <WhatsAppBookingCta
            clientId={clientId!}
            phone={clientPhone}
            clientName={clientName}
            source="article_dock"
            articleId={articleId}
          />
          <div className="flex items-center gap-3 text-[12px] font-semibold text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            أو
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}
      <BookingForm
        clientId={clientId!}
        articleId={articleId}
        source="article_dock"
        clientName={clientName}
        user={bookingUser}
        submitLabel="اطلب اتصال"
      />
    </div>
  ) : isLink ? (
    <CtaTrackedLink
      href={cta.url!}
      label={linkLabel}
      type="LINK"
      articleId={articleId}
      clientId={clientId ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
    >
      <IconExternal className="h-4 w-4" />
      {linkLabel}
    </CtaTrackedLink>
  ) : null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      {/* Primary — booking form (FORM) or external link (LINK) */}
      {isForm && (
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label={`${bookLabel} — ${clientName}`}
              className={cn(pill, "h-11 flex-1 bg-amber-500 text-black shadow-[0_6px_12px_-6px_rgba(245,158,11,0.55)]")}
            >
              <IconCalendar className="h-4 w-4" />
              {bookLabel}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" dir="rtl" className="mx-auto max-w-[480px] rounded-t-2xl p-0">
            <div className="pe-4 ps-12 pt-4">
              <SheetTitle className="text-base font-bold leading-snug">{clientName}</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                ✓ موثّق من مدوّنتي · يردّون خلال ساعات العمل
              </SheetDescription>
            </div>
            <div className="max-h-[85vh] overflow-y-auto p-4">{bookingBlock}</div>
          </SheetContent>
        </Sheet>
      )}

      {isLink && (
        <CtaTrackedLink
          href={cta.url!}
          label={linkLabel}
          type="LINK"
          articleId={articleId}
          clientId={clientId ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(pill, "h-11 flex-1 bg-primary text-primary-foreground shadow-[0_6px_12px_-6px_rgba(15,118,110,0.5)]")}
        >
          <IconExternal className="h-4 w-4" />
          {linkLabel}
        </CtaTrackedLink>
      )}

      {/* WhatsApp — icon-only (keeps the one-tap lead path); label lives in the booking sheet */}
      {clientPhone && clientId && (
        <WhatsAppLeadLink
          phone={clientPhone}
          clientId={clientId}
          source="article_dock"
          articleId={articleId}
          message={bookingWhatsappMessage(clientName)}
          ariaLabel={`تواصل عبر واتساب مع ${clientName}`}
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#25d366] text-white shadow-[0_6px_12px_-8px_rgba(37,211,102,0.55)] transition-transform active:scale-[0.98]"
        >
          <WhatsAppIcon size={20} />
        </WhatsAppLeadLink>
      )}

      {/* Logo → client info sheet (identity + repeated actions) */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label={`معلومات ${clientName}`}
            className={cn(
              "relative grid size-11 shrink-0 place-items-center overflow-hidden bg-background shadow-sm outline outline-2 outline-background ring-2 ring-primary/50",
              BRAND_AVATAR_RADIUS
            )}
          >
            {clientLogoUrl ? (
              <NextImage src={clientLogoUrl} alt={clientName} width={44} height={44} className="size-full object-contain p-1" sizes="44px" />
            ) : (
              <IconClients className="size-5 text-primary" />
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" dir="rtl" className="mx-auto max-w-[480px] rounded-t-2xl p-0">
          <SheetTitle className="sr-only">بطاقة {clientName}</SheetTitle>
          <SheetDescription className="sr-only">معلومات العميل وطلب الحجز.</SheetDescription>
          <div className="max-h-[85vh] overflow-y-auto p-4">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden />
            {clientCard}
            {bookingBlock && <div className="mt-4">{bookingBlock}</div>}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
