import Link from "next/link";
import { PartnerAvatar } from "@modonty/shared/components/partner-avatar/PartnerAvatar";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { buttonVariants } from "@/components/ui/button";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { ModontyArticlesMark } from "@/components/icons/modonty-articles-mark";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { RatingStars } from "@/components/shared/rating-stars/RatingStars";
import { IconMapPin } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { toneForSlug } from "@/lib/industry-tones";
import { messages, formatCount } from "@/lib/i18n/messages";
import type { ClientCtaMode } from "@prisma/client";
import type { ClientListItem } from "@/lib/queries/get-clients-list";

const text = messages.clients.partnerCard;
const counts = messages.clients.counts;

/** The action word matches what the partner offers; the destination never changes. */
const ACTION_LABEL: Record<ClientCtaMode, string> = {
  FORM: text.bookButton,
  LINK: text.shopButton,
  NONE: text.viewProfileButton,
};

interface PartnerCardMobileProps {
  partner: ClientListItem;
}

/**
 * The partner card a PHONE visitor gets. Slimmed to one row on 21 Aug, then re-grown on
 * 23 Aug (Khalid: «more helpful and more data — make it catchy») once the vertical fields
 * rail freed the column: stacked now, so the width the rail took away stops fighting the
 * name and the button for one line.
 *
 * The order is still the three questions — «مين هو؟» «أثق فيه؟» «كيف أوصله؟» — with two
 * additions that ANSWER the second one instead of asserting it: one line of what he does
 * in his own words, and his published output (articles · reels), which is the proof a
 * reader can check. A featured partner opens with the cover he paid for — that is the
 * catch — and keeps the brand-teal action.
 */
export function PartnerCardMobile({ partner }: PartnerCardMobileProps) {
  const href = `/clients/${encodeURIComponent(partner.slug)}`;
  const action = partner.ctaLabel?.trim() || ACTION_LABEL[partner.ctaMode];
  const services = partner.services.slice(0, 2);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card",
        // The whole row is one target (the name's `after:inset-0`); it answers on touch-down
        // like the article card does — `:active` reaches the row from the pressed link.
        "motion-safe:transition-transform motion-safe:duration-100 motion-safe:active:scale-[0.99]",
        partner.isFeatured ? "border-primary/30 shadow-sm" : "border-border",
      )}
    >
      {/* EVERY card wears the 4px top line of its field, the same line the field's own
          tile wears — it says «which field», not «who paid». */}
      <span className={cn("block h-1", toneForSlug(partner.industry?.slug).bar)} aria-hidden />

      {/* The cover only a featured partner has — the query only fetches it for him. */}
      {partner.isFeatured && partner.heroImage && (
        <span className="relative block h-16">
          <OptimizedImage
            media={asMedia(partner.heroImage)}
            alt=""
            fill
            sizes="(max-width: 1240px) 70vw, 300px"
            className="object-cover"
            loading="lazy"
            decoding="async"
          />
        </span>
      )}

      <div className="space-y-2 p-3">
        <div className="flex items-center gap-2.5">
          {/* Not a link: the name's `after:absolute after:inset-0` already makes the whole
              card one tap target. */}
          <div className="shrink-0">
            <PartnerAvatar media={partner.logo ? asMedia(partner.logo, partner.name) : null} name={partner.name} size="small" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-foreground">
              <Link
                href={href}
                className="truncate rounded-sm after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
              >
                {partner.name}
              </Link>
              <ModontyTrustMark className="h-4 w-4 shrink-0" />
              <span className="sr-only">{messages.shared.badges.verifiedPartnerLabel}</span>
            </h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              {partner.industry?.name && <span className="truncate font-medium text-link-accent">{partner.industry.name}</span>}
              {partner.city && (
                <span className="inline-flex items-center gap-0.5">
                  <IconMapPin className="h-3 w-3" aria-hidden />
                  {partner.city}
                </span>
              )}
              {partner.yearsInBusiness && (
                <span>
                  {formatCount(partner.yearsInBusiness, counts.yearsCount)} {text.yearsExperienceSuffix}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* What he does, in his own words — one line, not the old two-line block. */}
        {partner.description && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{partner.description}</p>
        )}

        {/* The proof line: rating, then what he actually PUBLISHED. A partner with output
            shows it; a partner without shows nothing rather than a row of zeros. */}
        {(partner.rating || partner.articleCount > 0 || partner.reelCount > 0) && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {partner.rating && <RatingStars average={partner.rating.average} count={partner.rating.count} />}
            {partner.articleCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <ModontyArticlesMark className="size-3.5" aria-hidden />
                {formatCount(partner.articleCount, counts.articlesCount)}
              </span>
            )}
            {partner.reelCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <ModontyReelsMark className="size-3.5" aria-hidden />
                {formatCount(partner.reelCount, counts.reelsCount)}
              </span>
            )}
          </p>
        )}

        <div className="flex items-center gap-2">
          {/* His services fill the space beside the action — tap-free context, two at most. */}
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {services.map((service) => (
              <span key={service} className="truncate rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {service}
              </span>
            ))}
          </div>
          {/* `relative` lifts the button above the card-wide link overlay so it stays
              tappable. 44px floor for a finger. Premium keeps the brand-teal action —
              the spotlight visible in the action itself. */}
          <Link
            href={href}
            className={buttonVariants({
              size: "sm",
              className: cn(
                "relative min-h-11 shrink-0",
                partner.isFeatured && "!bg-accent !text-accent-foreground hover:!bg-accent/90",
              ),
            })}
          >
            {action}
          </Link>
        </div>
      </div>
    </article>
  );
}
