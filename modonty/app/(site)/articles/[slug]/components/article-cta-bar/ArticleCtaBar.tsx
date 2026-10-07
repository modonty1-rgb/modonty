import type React from "react";
import { CTA_BAR_PRIMARY_CLASS, MobileCtaBar } from "@/components/shared/mobile-cta-bar/MobileCtaBar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { ModontyShoppingMark } from "@/components/icons/modonty-shopping-mark";
import { ModontyBookingMark } from "@/components/icons/modonty-booking-mark";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { IconExternal } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";

import { isWhatsAppUrl } from "../../helpers/is-whatsapp-url";

interface ArticleCtaBarProps {
  clientName: string;
  clientSlug: string;
  /** E.164 number when the partner has one — decides whether the WhatsApp door exists. */
  clientPhone?: string | null;
  /** The article's button, or its client's as the admin set it (resolveArticleCta). */
  cta: { mode: "NONE" | "FORM" | "LINK"; label?: string | null; url?: string | null; own?: boolean };
  /** لعدّ ضغطات الزرّ على مقاله (ctaClicks). */
  articleId?: string;
  clientId?: string | null;
  /** شعارُ العميل بين الزرّين — يفتح نافذتَه من تحت (خالد ٣ أكتوبر ٢٠٢٦). واتساب يصير أيقونة ليتّسع الزرُّ الكبير. */
  clientSlot?: React.ReactNode;
}

/**
 * The article page's configuration of the shared mobile action bar — «فلو زرّ المقال», approved by
 * Khalid on 3 Oct 2026 (documents/qa/mobile-audit/article-cta-flow.html · playbook «زرّ المقال»).
 *
 * The client is the base: the admin sets ONE button for him, and every article of his carries it.
 * An article may override it with its own button (ARTCTA), for that article only. Whatever the big
 * button says is exactly what it does:
 *   article button → its link (the product itself)
 *   client FORM    → his booking page
 *   client LINK    → his link (store / wa.me / tel:)
 *   no button set  → «صفحة {name}», his profile on modonty
 * It used to take the client's LABEL but always send to his profile — «راسلنا واتساب» opened a
 * page, not WhatsApp — and an unset client got «احجز الآن» with no booking behind it.
 *
 * The WhatsApp icon comes from the client's number, and drops out when the big button is already
 * WhatsApp (or there is no number), so the bar never shows two doors to the same place.
 */
export function ArticleCtaBar({ clientName, clientSlug, clientPhone, cta, articleId, clientId, clientSlot }: ArticleCtaBarProps) {
  const t = messages.article.cta;
  const partnerHref = `/clients/${encodeURIComponent(clientSlug)}`;
  // wa.me takes digits only — a stored «+966 55 …» would 404 the deep link.
  const waDigits = clientPhone?.replace(/\D/g, "") ?? "";

  const linkUrl = cta.mode === "LINK" ? cta.url?.trim() || null : null;
  const bigIsWhatsApp = isWhatsAppUrl(linkUrl);
  const linkClass = cn(buttonVariants({ variant: "ghost" }), CTA_BAR_PRIMARY_CLASS);
  const LinkIcon = bigIsWhatsApp ? WhatsAppIcon : cta.own ? ModontyShoppingMark : IconExternal;

  const secondary =
    waDigits && !bigIsWhatsApp
      ? { href: `https://wa.me/${waDigits}`, label: t.whatsapp, icon: WhatsAppIcon, external: true, iconOnly: !!clientSlot }
      : undefined;

  const ariaLabel = `${t.contactWith} ${clientName}`;

  // Article button, or the client's LINK: an outside link, counted on the article.
  if (linkUrl) {
    const label = cta.label?.trim() || (cta.own ? "" : t.visitSite);
    return (
      <MobileCtaBar
        ariaLabel={ariaLabel}
        primarySlot={
          <CtaTrackedLink
            href={linkUrl}
            label={label}
            type="LINK"
            articleId={articleId}
            clientId={clientId ?? undefined}
            target="_blank"
            rel="noopener"
            className={linkClass}
          >
            <LinkIcon className="!size-5 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">{label}</span>
          </CtaTrackedLink>
        }
        middleSlot={clientSlot}
        secondary={secondary}
      />
    );
  }

  // Client FORM → his booking page; nothing set → his profile, named for what it is.
  const primary =
    cta.mode === "FORM"
      ? {
          href: `${partnerHref}/book?source=article_dock${articleId ? `&article=${articleId}` : ""}`,
          label: cta.label?.trim() || t.book,
          icon: ModontyBookingMark,
        }
      : { href: partnerHref, label: `${t.clientPage} ${clientName}`, icon: ModontyPartnerMark };

  return <MobileCtaBar ariaLabel={ariaLabel} primary={primary} middleSlot={clientSlot} secondary={secondary} />;
}
