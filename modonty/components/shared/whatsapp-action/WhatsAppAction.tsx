import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { WhatsAppLeadLink } from "@/components/cta/whatsapp-icon-link";
import { bookingWhatsappMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { messages } from "@/lib/i18n/messages";
import type { BookingSource } from "@/components/shared/booking-form/booking-actions";

interface WhatsAppActionProps {
  /** As the partner stored it — normalised downstream by `getWhatsAppLink`. */
  phone: string | null | undefined;
  clientId: string;
  clientName: string;
  /** Where the visitor tapped from — kept on the lead so the partner sees what worked. */
  source: BookingSource;
  articleId?: string | null;
  /**
   * `solid` — the primary chat button (booking sheet, booking page); add `w-full` to fill.
   * `quiet` — a soft pill for lists and rails, where green must not shout over the page.
   * `icon` — round, icon only, for tight rows.
   * `dock` — filled square, for the mobile action bar where every button is a square.
   */
  variant?: "solid" | "quiet" | "icon" | "dock";
  label?: string;
  className?: string;
}

// WhatsApp green is the one colour a visitor recognises before reading a word; our own
// brand blue here would cost the instant «آه، واتساب» that makes this button work. The
// shape changes with the surface, the colour and the icon never do.
const VARIANT = {
  solid:
    "h-11 gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold text-white shadow-[0_10px_20px_-12px_rgba(37,211,102,.9)] transition-[background-color,transform] sm:hover:bg-[#1EBE5A] sm:hover:-translate-y-px",
  quiet:
    "h-9 gap-2 rounded-full bg-[#25D366]/10 px-4 text-sm font-medium text-[#0F7B45] ring-1 ring-inset ring-[#25D366]/30 transition-colors sm:hover:bg-[#25D366]/20 dark:text-[#4BE08A]",
  icon: "size-9 rounded-full bg-[#25D366]/10 text-[#0F7B45] ring-1 ring-inset ring-[#25D366]/30 transition-colors sm:hover:bg-[#25D366]/20 dark:text-[#4BE08A]",
  dock: "size-11 rounded-xl bg-[#25D366] text-white shadow-[0_6px_12px_-8px_rgba(37,211,102,.55)] transition-transform active:scale-[0.98]",
} as const;

/**
 * «واتساب» as one component wherever it appears — partner page, booking bar, contact
 * block. It owns the LOOK only: the number cleanup (Saudi + Egypt) and the deduped lead
 * write already live in `getWhatsAppLink` and `WhatsAppLeadLink`, and re-implementing
 * either would mean a partner's chat click stops showing up in his console.
 *
 * Renders nothing when the partner has no number: a green button that opens a broken chat
 * is worse than no button.
 */
export function WhatsAppAction({
  phone,
  clientId,
  clientName,
  source,
  articleId,
  variant = "solid",
  label = messages.shared.whatsapp.defaultButtonLabel,
  className,
}: WhatsAppActionProps) {
  if (!phone?.trim()) return null;

  const isIcon = variant === "icon" || variant === "dock";

  return (
    <WhatsAppLeadLink
      phone={phone}
      clientId={clientId}
      source={source}
      articleId={articleId}
      message={bookingWhatsappMessage(clientName)}
      ariaLabel={`${label} — ${clientName}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        VARIANT[variant],
        className,
      )}
    >
      <WhatsAppIcon size={variant === "dock" ? 20 : isIcon ? 16 : 18} />
      {!isIcon && label}
    </WhatsAppLeadLink>
  );
}
