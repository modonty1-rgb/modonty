"use client";

import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { IconWebsite } from "@/lib/icons";

import { BookingCtaLink } from "@/components/booking-cta-link";
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
  clientUrl: string | null;
  ctaMode: "FORM" | "LINK" | "NONE";
  user: { name: string | null; email: string | null } | null;
  followers: number;
  initialIsFollowing: boolean;
  socialLinks: SocialLink[];
}

/** Focal CTA bar: book / follow / share + social links. Interactive client island. */
export function HeroCtaRow({
  clientId,
  clientName,
  clientSlug,
  clientUrl,
  ctaMode,
  followers,
  initialIsFollowing,
  socialLinks,
}: HeroCtaRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Booking/link CTA + follow + share are DESKTOP-only here — on mobile they
          live in the sticky bottom bar (ClientBottomBar), so they're not duplicated.
          Social links stay visible on every size. */}
      <div className="hidden flex-wrap items-center gap-2.5 lg:flex">
        {/* Primary CTA — احجز الآن */}
        {ctaMode === "FORM" && (
          <div className="min-w-[170px] flex-1">
            <BookingCtaLink clientSlug={clientSlug} source="client_page" />
          </div>
        )}

        {ctaMode === "LINK" && clientUrl && (
          <CtaTrackedLink
            href={clientUrl}
            label="احجز الآن"
            type="BUTTON"
            clientId={clientId}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[170px] flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
          >
            <IconWebsite className="h-4 w-4" />
            احجز الآن
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
              className="grid h-[38px] w-[38px] place-items-center rounded-[9px] border border-border bg-card text-muted-foreground transition-colors hover:text-primary hover:border-primary [&>svg]:h-[18px] [&>svg]:w-[18px]"
            >
              <span aria-hidden="true">{link.platform.icon}</span>
            </CtaTrackedLink>
          ))}
        </div>
      )}
    </div>
  );
}
