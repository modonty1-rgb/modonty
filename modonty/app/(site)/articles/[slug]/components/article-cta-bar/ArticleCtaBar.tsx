import { MobileCtaBar } from "@/components/shared/mobile-cta-bar/MobileCtaBar";
import { ModontyBookingMark } from "@/components/icons/modonty-booking-mark";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { IconExternal } from "@/lib/icons";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";
import { messages } from "@/lib/i18n/messages";

interface ArticleCtaBarProps {
  clientName: string;
  clientSlug: string;
  /** The article Modo should open already knowing about. */
  articleSlug: string;
  /** E.164 number when the partner has one — decides whether the WhatsApp door exists. */
  clientPhone?: string | null;
  /** The partner's own call to action, as configured in the admin. */
  cta: { mode: "NONE" | "FORM" | "LINK"; label?: string | null; url?: string | null };
}

/**
 * The article page's configuration of the shared mobile bottom bar (Khalid, 21 Aug).
 *
 * It replaces a bar built only for this page — one that carried a booking sheet, a tracked
 * WhatsApp action, and a second full copy of the partner card waiting inside a panel. Same
 * structure as every other page now: two links and Modo between them.
 *
 * «احجز الآن» goes to the partner's page on modonty rather than opening a form here, on
 * Khalid's call: the booking form and the tracked WhatsApp button already live there, so the
 * reader lands where the whole conversation can happen instead of a sheet over an article.
 *
 * The second door adapts to what the partner actually has: WhatsApp when there is a number,
 * their own site when the admin configured a link, and the partner directory otherwise — so
 * the bar never shows two buttons that lead to the same place.
 */
export function ArticleCtaBar({ clientName, clientSlug, articleSlug, clientPhone, cta }: ArticleCtaBarProps) {
  const t = messages.article.cta;
  const partnerHref = `/clients/${clientSlug}`;
  // wa.me takes digits only — a stored «+966 55 …» would 404 the deep link.
  const waDigits = clientPhone?.replace(/\D/g, "") ?? "";

  const secondary = waDigits
    ? { href: `https://wa.me/${waDigits}`, label: t.whatsapp, icon: WhatsAppIcon, external: true }
    : cta.mode === "LINK" && cta.url
      ? { href: cta.url, label: cta.label?.trim() || t.visitSite, icon: IconExternal, external: true }
      : { href: "/clients", label: t.allPartners, icon: ModontyPartnerMark };

  return (
    <MobileCtaBar
      ariaLabel={`${t.contactWith} ${clientName}`}
      modoHref={`/modo-chat?article=${encodeURIComponent(articleSlug)}`}
      primary={{
        href: partnerHref,
        label: cta.label?.trim() || t.book,
        icon: ModontyBookingMark,
      }}
      secondary={secondary}
    />
  );
}
