import Link from "next/link";
import { PartnerAvatar } from "@modonty/shared/components/partner-avatar/PartnerAvatar";
import { asMedia } from "@modonty/shared/components/optimized-image";
import { buttonVariants } from "@/components/ui/button";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { RatingStars } from "@/components/shared/rating-stars/RatingStars";
import { IconMapPin } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { toneForSlug } from "@/app/(site)/industries/helpers/industry-tones";
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

interface PartnerCardMobileProps {
  partner: ClientListItem;
}

/**
 * The partner card a PHONE visitor gets (Khalid, 21 Aug: the full card ran ~300px each,
 * so twelve partners meant 4,467px of scrolling and only two faces per screen).
 *
 * Kept, because it answers the three questions in order — «مين هو؟» «أثق فيه؟» «كيف
 * أوصله؟»: the logo (the face he recognises), the name with the verified mark, one trust
 * line (city · rating · years), and one action.
 *
 * Dropped, because a phone screen is the scarce resource: the 6:1 cover, the two-line
 * description, the service chips and the capability icon row. All of it waits on the
 * partner's own page, one tap away — and this card is a doorway, not the destination.
 * The desktop `PartnerCard` is untouched.
 */
export function PartnerCardMobile({ partner }: PartnerCardMobileProps) {
  const href = `/clients/${encodeURIComponent(partner.slug)}`;
  const action = partner.ctaLabel?.trim() || ACTION_LABEL[partner.ctaMode];

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card",
        partner.isFeatured ? "border-primary/30 shadow-sm" : "border-border",
      )}
    >
      {/* EVERY card wears the 4px top line of its field, the same line the field's own
          card wears (Khalid, 21 Aug) — it says «which field», not «who paid». Premium is
          already told by the brand-teal action button, so the line is free to do the
          honest job of colour-coding the list. */}
      <span className={cn("block h-1", toneForSlug(partner.industry?.slug).bar)} aria-hidden />

      <div className="flex items-center gap-3 p-3">
      {/* Not a link: the name's `after:absolute after:inset-0` already makes the whole
          card one tap target. A second 32×32 anchor here only added a sub-44px target and
          a duplicate href for crawlers (measured 21 Aug). */}
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

        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          {partner.industry?.name && <span className="truncate font-medium text-link-accent">{partner.industry.name}</span>}
          {partner.city && (
            <span className="inline-flex items-center gap-0.5">
              <IconMapPin className="h-3 w-3" aria-hidden />
              {partner.city}
            </span>
          )}
          {partner.rating && <RatingStars average={partner.rating.average} count={partner.rating.count} />}
          {partner.yearsInBusiness && (
            <span>
              {formatCount(partner.yearsInBusiness, messages.clients.counts.yearsCount)} {text.yearsExperienceSuffix}
            </span>
          )}
        </p>
      </div>

      {/* `relative` lifts the button above the card-wide link overlay so it stays tappable.
          The featured medal is NOT drawn here: on a 390px row it landed on top of this
          button (measured 21 Aug). The primary border + ring carry «مميّز» instead. */}
      <Link
        href={href}
        className={buttonVariants({
          size: "sm",
          className: cn(
            // 44px floor for a finger (Apple HIG minimum; Material asks 48) — the `sm`
            // button ships 36 (measured 21 Aug).
            "relative min-h-11 shrink-0",
            // Premium partners get the brand-teal action — the same button the site's
            // bottom bar uses for «احجز الآن» (Khalid, 21 Aug), so the spotlight they pay
            // for is visible in the action itself, not only in the bar above.
            // `!` needed: the button's own variant paints `bg-primary` and outranks a
            // plain utility here (measured: the premium button still rendered blue).
            partner.isFeatured && "!bg-accent !text-accent-foreground hover:!bg-accent/90",
          ),
        })}
      >
        {action}
      </Link>
      </div>
    </article>
  );
}
