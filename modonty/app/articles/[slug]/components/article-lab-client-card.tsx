import NextImage from "next/image";
import type { ComponentType, SVGProps } from "react";

import { OptimizedImage } from "@/components/media/OptimizedImage";
import { Card } from "@/components/ui/card";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { IconClients, IconChevronLeft, IconPhone, IconVerified, IconExternal } from "@/lib/icons";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Linkedin } from "@/components/icons/linkedin";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Youtube } from "@/components/icons/youtube";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";

import { AskClientDialog } from "@/app/articles/[slug]/components/ask-client-dialog";
import { BookingDialog } from "@/app/articles/[slug]/components/booking-dialog";
import type { BookingSource } from "@/app/articles/[slug]/actions/booking-actions";

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

function waNumber(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) return "966" + d.slice(1);
  if (!d.startsWith("966") && d.length <= 9) return "966" + d;
  return d;
}

interface ArticleLabClientCardProps {
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
    logoMedia?: { url: string } | null;
    heroImageMedia?: { url: string } | null;
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

const railBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors";

export function ArticleLabClientCard({ client, askClientProps, cta }: ArticleLabClientCardProps) {
  const logoUrl = client.logoMedia?.url ?? null;
  const heroUrl = client.heroImageMedia?.url ?? null;
  const hasPhone = !!client.phone?.trim();
  // brief falls back across the fields admins actually fill (DRY, data-agnostic)
  const brief = client.description?.trim() || client.businessBrief?.trim() || client.slogan?.trim() || "";
  const social = (client.sameAs ?? [])
    .map((url) => ({ url, meta: socialIconFor(url) }))
    .filter((s): s is { url: string; meta: { icon: IconC; label: string } } => s.meta !== null);
  const hasContactRow = hasPhone || social.length > 0;

  return (
    <Card className="min-w-0 overflow-hidden shadow-md">
      {/* media */}
      <div className="relative flex aspect-[16/6] w-full shrink-0 items-center justify-center overflow-hidden bg-muted">
        {heroUrl && (
          <>
            <div className="absolute inset-0">
              <OptimizedImage src={heroUrl} alt={client.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 280px" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
          </>
        )}
        {logoUrl ? (
          heroUrl ? (
            <div className="absolute bottom-3 left-3 z-10 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background shadow-lg ring-2 ring-background">
              <NextImage src={logoUrl} alt={client.name} width={56} height={56} className="object-contain p-1.5" sizes="56px" />
            </div>
          ) : (
            <div className="relative z-10 h-20 w-20 shrink-0 overflow-hidden rounded-full bg-background shadow-sm ring-2 ring-border">
              <NextImage src={logoUrl} alt={client.name} fill className="object-contain p-3" sizes="80px" />
            </div>
          )
        ) : !heroUrl ? (
          <IconClients className="relative z-10 h-12 w-12 text-muted-foreground" />
        ) : null}
      </div>

      {/* body */}
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center gap-1.5">
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
              <IconVerified className="h-4 w-4 shrink-0 text-primary" aria-label="موثّق" />
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

        {/* contact + social rail (conditional — no data, no icon) */}
        {hasContactRow && (
          <nav className="flex flex-wrap items-center gap-1.5 pt-0.5" aria-label="تواصل ومتابعة">
            {hasPhone && (
              <>
                <a
                  href={`https://wa.me/${waNumber(client.phone!)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="واتساب"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#25D366] text-white transition-opacity hover:opacity-90"
                >
                  <WhatsAppIcon size={17} />
                </a>
                <a href={`tel:${client.phone}`} aria-label="اتصال" className={railBtn}>
                  <IconPhone className="h-4 w-4" />
                </a>
              </>
            )}
            {hasPhone && social.length > 0 && <span className="mx-1 h-5 w-px bg-border" />}
            {social.map(({ url, meta: { icon: Icon, label } }) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={railBtn}>
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </nav>
        )}

        {/* DUAL CTA */}
        {askClientProps?.clientId && (
          <AskClientDialog
            articleId={askClientProps.articleId}
            clientId={askClientProps.clientId}
            clientName={client.name}
            articleTitle={askClientProps.articleTitle}
            user={askClientProps.user}
            pendingFaqs={askClientProps.pendingFaqs}
            embedInCard
          />
        )}

        {/* Primary CTA — FORM (booking dialog) or LINK (external store), per admin config.
            Hidden when the booking sheet owns the CTA (cta.hideOwnCta). NONE → nothing. */}
        {cta && !cta.hideOwnCta && cta.mode === "FORM" && (
          <BookingDialog
            clientId={client.id}
            articleId={cta.articleId}
            clientName={client.name}
            source={cta.source}
            user={cta.user}
            label={cta.label}
          />
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <IconExternal className="h-4 w-4" />
            {cta.label?.trim() || "تسوّق الآن"}
          </CtaTrackedLink>
        )}
      </div>
    </Card>
  );
}
