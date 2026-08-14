"use client";

import type { ReactNode } from "react";

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { recordWhatsappLead, type BookingSource } from "@/app/articles/[slug]/actions/booking-actions";

interface WhatsAppLeadLinkProps {
  phone: string;
  clientId: string;
  source: BookingSource;
  articleId?: string | null;
  size?: number;
  className?: string;
  ariaLabel?: string;
  /** Optional pre-filled wa.me message (e.g. the Modonty-attributed booking greeting). */
  message?: string;
  /** Custom link body (e.g. icon + label). Defaults to the WhatsApp icon only. */
  children?: ReactNode;
}

/**
 * WhatsApp link that records a deduped «تواصل واتساب» lead server-side on tap — so every
 * WhatsApp entry point on the site (rails, listing cards, primary CTAs) funnels into one
 * console lead per visit. Pass `children` for a full button; omit for an icon-only link.
 */
export function WhatsAppLeadLink({
  phone,
  clientId,
  source,
  articleId,
  size = 17,
  className,
  ariaLabel = "واتساب",
  message,
  children,
}: WhatsAppLeadLinkProps) {
  return (
    <a
      href={getWhatsAppLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={() => void recordWhatsappLead({ clientId, source, articleId: articleId ?? null })}
      className={className}
    >
      {children ?? <WhatsAppIcon size={size} />}
    </a>
  );
}

/** Backward-compatible alias: icon-only WhatsApp lead link. */
export const WhatsAppIconLink = WhatsAppLeadLink;
