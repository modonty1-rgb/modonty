import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { buttonVariants } from "@/components/ui/button";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { CapabilityIcons } from "@/components/shared/capability-icons/CapabilityIcons";
import { FeaturedBadge } from "@/components/shared/featured-badge/FeaturedBadge";
import { RatingStars } from "@/components/shared/rating-stars/RatingStars";
import { ServiceChips } from "@/components/shared/service-chips/ServiceChips";
import { TrustNote } from "@/components/shared/trust-note/TrustNote";
import { IconMapPin } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { messages, formatCount } from "@/lib/i18n/messages";
import type { ClientCtaMode } from "@prisma/client";
import type { ClientListItem } from "@/lib/queries/get-clients-list";

const text = messages.clients.partnerCard;

/** The action word matches what the partner offers; the destination never changes. */
const ACTION_LABEL: Record<ClientCtaMode, string> = {
  FORM: text.bookButton,
  LINK: text.shopButton,
  NONE: text.viewProfileButton,
};

interface PartnerCardProps {
  partner: ClientListItem;
}

/**
 * One partner, built around the three questions a visitor asks — «يخدم حاجتي؟» then
 * «أثق فيه؟» then «كيف أوصله؟» (Khalid, 2026-08-16: «ما يهمّني كم مقال عنده»). Publishing
 * counters were removed: they measure our subscription, not his usefulness.
 *
 * Every action leads to the partner's own page, never straight to WhatsApp or an external
 * store (Khalid, 2026-08-16): that page is the one Google indexes and the one that counts
 * the visit, so sending the click there feeds the partner's ranking instead of leaking the
 * visitor off-site. Booking and contact happen there.
 */
export function PartnerCard({ partner }: PartnerCardProps) {
  const href = `/clients/${encodeURIComponent(partner.slug)}`;
  const initial = partner.name.trim().charAt(0);
  const action = partner.ctaLabel?.trim() || ACTION_LABEL[partner.ctaMode];

  return (
    <article
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 transition-transform duration-200 [content-visibility:auto] [contain-intrinsic-size:auto_220px] sm:hover:-translate-y-0.5 sm:hover:shadow-md",
        partner.isFeatured && "border-primary/20",
        partner.heroImage && "pt-0",
      )}
    >
      {/* Featured partners get their cover on the card — the spotlight they pay for
          (Khalid, 2026-08-16). The box is 6:1 because that is what the covers actually
          are: 8 of the 9 measured 2400×400 and the ninth 2544×416 (2026-08-16), so any
          other ratio crops the artwork the client paid a designer for. Bleeds to the card
          edges via the negative inset. */}
      {partner.heroImage && (
        <div className="relative -mx-4 mb-3">
          {/* `relative` stays on the anchor: it is the fill image's positioning parent. */}
          <Link href={href} aria-hidden tabIndex={-1} className="relative block aspect-[6/1] overflow-hidden bg-muted">
            <OptimizedImage
              media={asMedia(partner.heroImage, partner.name)}
              alt=""
              fill
              sizes="(min-width: 1240px) 560px, (min-width: 768px) 600px, 100vw"
              loading="lazy"
              className="object-cover transition-transform duration-300 sm:group-hover:scale-[1.02]"
            />
          </Link>
          {/* The medal needs room to be read — at 48px the star and the M separate
              cleanly, at 16px they merge into one blob (measured 2026-08-16). So it
              straddles the cover's far edge instead of squeezing beside the name, away
              from the logo and the title. */}
          {partner.isFeatured && <FeaturedBadge variant="medal" className="absolute -bottom-5 end-4" />}
        </div>
      )}

      {/* No cover to sit on — the medal takes the card's own corner. */}
      {partner.isFeatured && !partner.heroImage && (
        <FeaturedBadge variant="medal" className="absolute end-3 top-3" />
      )}

      <div className="flex items-start gap-3">
        <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
          {partner.logo ? (
            <OptimizedImage media={asMedia(partner.logo, partner.name)} alt="" fill sizes="44px" loading="lazy" className="object-cover" />
          ) : (
            <span aria-hidden className="text-base font-bold text-link">{initial}</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Link href={href} className="truncate rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:hover:text-link">
              {partner.name}
            </Link>
            {/* The mark is the whole promise of this page: this one was checked. It draws
                itself aria-hidden, so the meaning is spelled out for screen readers. */}
            <ModontyTrustMark className="h-4 w-4 shrink-0" />
            <span className="sr-only">{messages.shared.badges.verifiedPartnerLabel}</span>
          </h2>
          {/* Trust row — where he is, his papers, how long he has been at it. */}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {partner.city && (
              <span className="inline-flex items-center gap-1">
                <IconMapPin className="h-3.5 w-3.5" aria-hidden />
                {partner.city}
              </span>
            )}
            {partner.rating && (
              <>
                <span aria-hidden>·</span>
                <RatingStars average={partner.rating.average} count={partner.rating.count} />
              </>
            )}
            {(partner.credential || partner.hasVerifiedPapers) && (
              <>
                <span aria-hidden>·</span>
                <TrustNote credential={partner.credential} hasVerifiedPapers={partner.hasVerifiedPapers} />
              </>
            )}
            {partner.yearsInBusiness && (
              <>
                <span aria-hidden>·</span>
                <span>{formatCount(partner.yearsInBusiness, messages.clients.counts.yearsCount)} {text.yearsExperienceSuffix}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <ServiceChips services={partner.services} fallback={partner.industry?.name} />

      {partner.description && (
        <p className="line-clamp-2 text-[13px] leading-6 text-muted-foreground">{partner.description}</p>
      )}

      {/* Action on one end, what waits for him on the other. `mt-auto` pins this row to
          the card's bottom edge — without it, a grid row stretches every card to match
          its tallest sibling, but a short card's action row stays glued to its own short
          content instead of dropping to the shared baseline, so buttons across a row land
          at different heights (measured 2026-08-16: a 72px gap between two cards in the
          same /booking row). */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <Link href={href} className={buttonVariants({ size: "sm", className: "min-w-32" })}>
          {action}
        </Link>
        <CapabilityIcons
          hasWhatsapp={partner.hasWhatsapp}
          galleryCount={partner.galleryCount}
          hasVideo={partner.hasVideo}
          reelCount={partner.reelCount}
          articleCount={partner.articleCount}
        />
      </div>
    </article>
  );
}
