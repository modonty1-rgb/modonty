import { mediaSrc } from "@modonty/shared/lib/media-src";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import type { ComponentType, SVGProps } from "react";

import { OptimizedImage } from "@modonty/shared/components/optimized-image";
import { PartnerAvatar } from "@modonty/shared/components/partner-avatar/PartnerAvatar";
import { Card } from "@/components/ui/card";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { IconClients, IconChevronLeft, IconPhone, IconExternal } from "@/lib/icons";
import { Linkedin } from "@/components/icons/linkedin";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Youtube } from "@/components/icons/youtube";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";

import { AskClientDialog } from "@/components/client/ask-client-dialog";
import { BookingCtaLink } from "@/components/cta/booking-cta-link";
import type { BookingSource } from "@/components/shared/booking-form/booking-actions";

type IconC = ComponentType<SVGProps<SVGSVGElement>>;

// sameAs is a flat URL array — derive the platform icon from the host.
function socialIconFor(url: string): { icon: IconC; label: string } | null {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
  if (host.includes("linkedin")) return { icon: Linkedin, label: "لينكد إن" };
  if (host === "x.com" || host.endsWith(".x.com") || host.includes("twitter")) return { icon: Twitter, label: "إكس" };
  if (host.includes("facebook") || host.includes("fb.")) return { icon: SocialFacebookOutline, label: "فيسبوك" };
  if (host.includes("instagram")) return { icon: Instagram, label: "انستغرام" };
  if (host.includes("youtube") || host.includes("youtu.be")) return { icon: Youtube, label: "يوتيوب" };
  if (host.includes("tiktok")) return { icon: TiktokLogoLight, label: "تيك توك" };
  if (host.includes("snapchat")) return { icon: RoundSnapchat, label: "سناب شات" };
  return null;
}

interface PartnerCardProps {
  client: {
    id: string;
    name: string;
    slug: string;
    url?: string | null;
    description?: string | null;
    businessBrief?: string | null;
    slogan?: string | null;
    phone?: string | null;
    sameAs?: string[];
    addressCity?: string | null;
    logoMedia?: { url: string; bunnyUrl: string | null; blurDataURL: string | null } | null;
    /** `width`/`height` are what let the cover box take the artwork's own shape. */
    heroImageMedia?: {
      url: string;
      bunnyUrl: string | null;
      blurDataURL: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
    /** Client Mini (1.91:1) media — preferred over the 6:1 hero for the card image. */
    media?: {
      url: string;
      bunnyUrl: string | null;
      blurDataURL: string | null;
      width?: number | null;
      height?: number | null;
    }[] | null;
  };
  askClientProps?: {
    articleId: string;
    clientId: string | null;
    articleTitle?: string;
    user: { name: string | null; email: string | null } | null;
    pendingFaqs?: PendingFaq[];
  };
  /**
   * Primary CTA config (admin-controlled). When `hideOwnCta` is true the card is
   * inside the booking sheet, which renders the CTA itself — so the card hides its own.
   */
  cta?: {
    mode: "NONE" | "FORM" | "LINK";
    label?: string | null;
    url?: string | null;
    articleId?: string | null;
    source: BookingSource;
    user: { name: string | null; email: string | null } | null;
    hideOwnCta?: boolean;
  };
}

interface PendingFaq {
  id: string;
  question: string;
  createdAt: Date;
}

// 44, not 32 — the width of a fingertip, and the floor both platform guidelines set (Apple 44pt,
// Material 48dp). Measured 19 Aug: six social buttons here were 32×32, small enough that the
// finger covers the target and the tap lands on the neighbour.
const railBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors";

export function PartnerCard({ client, askClientProps, cta }: PartnerCardProps) {
  // Pass the media ROW, not a resolved url — the shared component resolves src AND the
  // stored blur itself. Resolving here threw the placeholder away before it was ever seen.
  const logoMedia = client.logoMedia ?? null;
  // Client Mini (1.91:1) fills the 1200/630 card box exactly → preferred over the 6:1 hero.
  const heroMedia = (mediaSrc(client.media?.[0]) ? client.media?.[0] : null) ?? client.heroImageMedia ?? null;
  const hasPhone = !!client.phone?.trim();
  // brief falls back across the fields admins actually fill (DRY, data-agnostic)
  const brief = client.description?.trim() || client.businessBrief?.trim() || client.slogan?.trim() || "";
  // One icon per platform. A partner with two Facebook URLs rendered two identical buttons,
  // same glyph and same label, so the visitor picked by coin toss — the first one wins.
  const social = Array.from(
    (client.sameAs ?? [])
      .map((url) => ({ url, meta: socialIconFor(url) }))
      .filter((s): s is { url: string; meta: { icon: IconC; label: string } } => s.meta !== null)
      .reduce((byPlatform, s) => {
        if (!byPlatform.has(s.meta.label)) byPlatform.set(s.meta.label, s);
        return byPlatform;
      }, new Map<string, { url: string; meta: { icon: IconC; label: string } }>())
      .values()
  );
  const hasContactRow = hasPhone || social.length > 0;

  return (
    <Card className="min-w-0 overflow-hidden shadow-md">
      {/* media — aspect locked to the canonical hero spec (1200×630) so the image
          shows in full, consistent with the sidebar partner slider. */}
      {/* No fixed box: the cover draws at its own height and the card follows (Khalid, 19 Aug).
          It was locked to 1200/630, then to the dimensions on the media row — and both left
          black bands, because the row LIES: measured 19 Aug on Dr. Amr Saeed, the file on the
          CDN is 2400×400 (6:1) while the row says 2400×800 (3:1). `w-full h-auto` asks the
          image itself, so a wrong number in the database can no longer put a hole in the card.
          `width`/`height` still reserve space against layout shift; being off only costs one
          settle, not a permanent gap. */}
      <div className="relative w-full shrink-0 overflow-hidden bg-muted">
        {heroMedia && (
          <>
            {/* `contain`, not `cover`: these covers are the partner's own artwork with their
                name set into it, and cropping to fill cut the name off — «Dr. Amr S…». */}
            <OptimizedImage
              media={heroMedia}
              alt={client.name}
              width={heroMedia.width ?? 1200}
              height={heroMedia.height ?? 630}
              className="h-auto w-full object-contain"
              sizes="(max-width: 1024px) 100vw, 280px"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
          </>
        )}
        {!logoMedia && !heroMedia && (
          <IconClients className="relative z-10 h-12 w-12 text-muted-foreground" />
        )}
      </div>

      {/* body */}
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center gap-2.5">
          {/* Moved off the cover and onto this row (Khalid, 19 Aug) — over the banner it needed
              a white disc to stay legible, and that disc was the halo. */}
          {logoMedia && (
            <PartnerAvatar media={logoMedia} name={client.name} size="standard" />
          )}
          <h2 className="flex items-center gap-1.5 text-base font-semibold leading-tight">
            <CtaTrackedLink
              href={`/clients/${client.slug}`}
              label={client.name}
              type="LINK"
              articleId={askClientProps?.articleId}
              clientId={client.id}
              className="inline-flex items-center gap-1 text-foreground transition-colors hover:text-primary"
            >
              {client.name}
              <VerifiedBadge className="h-4 w-4" label="شريك موثّق" />
            </CtaTrackedLink>
          </h2>
          <IconChevronLeft className="ms-auto h-4 w-4 shrink-0 text-muted-foreground ltr:rotate-180" aria-hidden />
        </div>

        {client.addressCity?.trim() && (
          <p className="-mt-1 text-xs text-muted-foreground">{client.addressCity}</p>
        )}

        {/* brief — clamped to 2 lines (LinkedIn/Medium pattern) so the CTA never gets pushed down */}
        {brief && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{brief}</p>
        )}

        {/* One action row (Khalid, 19 Aug): the quiet ways to reach the partner on one side,
            the two things we want him to do on the other. They used to be three stacked
            full-width blocks — a social rail, then an amber «اسأل», then a blue «احجز» — so a
            card that ends an article ended with three competing bars.

            WhatsApp is gone from here: it already sits in the rail card that follows the reader
            the whole way down, and a second copy at the end is the same button twice. */}
        {(hasContactRow || askClientProps?.clientId || (cta && !cta.hideOwnCta && cta.mode === "FORM")) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {hasContactRow && (
              <nav className="flex items-center gap-1.5" aria-label="تواصل ومتابعة">
                {hasPhone && (
                  <a href={`tel:${client.phone}`} aria-label="اتصال" className={railBtn}>
                    <IconPhone className="h-4 w-4" />
                  </a>
                )}
                {hasPhone && social.length > 0 && <span className="mx-1 h-5 w-px bg-border" />}
                {social.map(({ url, meta: { icon: Icon, label } }) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={railBtn}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                ))}
              </nav>
            )}

            {/* The two actions sit together at the end of the row — «اسأل» quiet, «احجز» solid,
                so the pair reads as one choice with an obvious default. */}
            <div className="ms-auto flex items-center gap-2">
              {askClientProps?.clientId && (
                <AskClientDialog
                  articleId={askClientProps.articleId}
                  clientId={askClientProps.clientId}
                  clientName={client.name}
                  articleTitle={askClientProps.articleTitle}
                  user={askClientProps.user}
                  pendingFaqs={askClientProps.pendingFaqs}
                  triggerOnly
                  triggerClassName="w-auto h-11 px-4 bg-transparent border-border text-foreground font-semibold hover:bg-muted/60 hover:border-border shadow-none"
                />
              )}
              {cta && !cta.hideOwnCta && cta.mode === "FORM" && (
                <BookingCtaLink
                  clientSlug={client.slug}
                  articleId={cta.articleId}
                  source={cta.source}
                  label={cta.label}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground ring-1 ring-inset ring-white/25 transition-opacity hover:opacity-90"
                />
              )}
            </div>
          </div>
        )}
        {cta && !cta.hideOwnCta && cta.mode === "LINK" && cta.url && (
          <CtaTrackedLink
            href={cta.url}
            label={cta.label?.trim() || "تسوّق الآن"}
            type="LINK"
            articleId={cta.articleId ?? undefined}
            clientId={client.id}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground ring-1 ring-inset ring-white/25 transition-opacity hover:opacity-90"
          >
            <IconExternal className="h-4 w-4" />
            {cta.label?.trim() || "تسوّق الآن"}
          </CtaTrackedLink>
        )}
      </div>
    </Card>
  );
}
