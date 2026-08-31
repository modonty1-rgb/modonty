"use client";

import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { IconWebsite } from "@/lib/icons";

import { BookingCtaLink } from "@/components/cta/booking-cta-link";
import { ClientFollowButton } from "../client-follow-button";
import { ShareClientButtonWrapper } from "../share-client-button-wrapper";

interface SocialLink {
  url: string;
  platform: { name: string; icon: React.ReactNode };
}

interface HeroCtaRowProps {
  clientId: string;
  clientName: string;
  clientSlug: string;
  /** The admin-chosen destination (ctaUrl) — NOT the client's website. */
  linkUrl: string | null;
  /** The admin-chosen wording; falls back to the mode's default when unset. */
  ctaLabel: string | null;
  ctaMode: "FORM" | "LINK" | "NONE";
  user: { name: string | null; email: string | null } | null;
  followers: number;
  initialIsFollowing: boolean;
  socialLinks: SocialLink[];
}

/**
 * Focal CTA bar: book / follow / share + social links. Interactive client island.
 *
 * Reads the SAME three fields every other surface reads (ctaMode / ctaLabel / ctaUrl).
 * It used to hardcode «احجز الآن» and point at `client.url`, so a client set to
 * «راسلنا واتساب» showed the wrong words and sent the visitor to their website
 * instead of WhatsApp — while the bottom bar, the sheet and the article dock all
 * had it right (found in the live test, 2026-07-24).
 */
export function HeroCtaRow({
  clientId,
  clientName,
  clientSlug,
  linkUrl,
  ctaLabel,
  ctaMode,
  followers,
  initialIsFollowing,
  socialLinks,
}: HeroCtaRowProps) {
  const label = ctaLabel?.trim() || (ctaMode === "FORM" ? "احجز الآن" : "تسوّق الآن");
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Booking/link CTA + follow + share are DESKTOP-only here — on mobile they
          live in the sticky bottom bar (ClientBottomBar), so they're not duplicated.
          Social links stay visible on every size. */}
      <div className="hidden flex-wrap items-center gap-2.5 lg:flex">
        {/* Primary CTA — احجز الآن */}
        {ctaMode === "FORM" && (
          <div className="min-w-[170px] flex-1">
            <BookingCtaLink clientSlug={clientSlug} source="client_page" label={ctaLabel} />
          </div>
        )}

        {ctaMode === "LINK" && linkUrl && (
          <CtaTrackedLink
            href={linkUrl}
            label={label}
            type="BUTTON"
            clientId={clientId}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[170px] flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
          >
            <IconWebsite className="h-4 w-4" />
            {label}
          </CtaTrackedLink>
        )}

        <ClientFollowButton
          clientSlug={clientSlug}
          initialIsFollowing={initialIsFollowing}
          initialFollowersCount={followers}
          variant="outline"
          size="sm"
        />

        <ShareClientButtonWrapper
          clientName={clientName}
          clientUrl={`/clients/${encodeURIComponent(clientSlug)}`}
          clientId={clientId}
          clientSlug={clientSlug}
        />
      </div>

      {/* Social links */}
      {socialLinks.length > 0 && (
        <div className="flex items-center gap-2 ms-auto">
          {socialLinks.map((link, index) => (
            <CtaTrackedLink
              key={index}
              href={link.url}
              label={`Social (${link.platform.name})`}
              type="LINK"
              clientId={clientId}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.platform.name}
              className="grid h-[38px] w-[38px] place-items-center rounded-[9px] border border-border bg-card text-muted-foreground transition-colors hover:text-[hsl(var(--primary-ink,var(--primary)))] hover:border-primary [&>svg]:h-[18px] [&>svg]:w-[18px]"
            >
              <span aria-hidden="true">{link.platform.icon}</span>
            </CtaTrackedLink>
          ))}
        </div>
      )}
    </div>
  );
}
