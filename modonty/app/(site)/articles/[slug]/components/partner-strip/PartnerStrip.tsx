import Link from "next/link";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import { PartnerAvatar } from "@modonty/shared/components/partner-avatar/PartnerAvatar";

import { BookingCtaLink } from "@/components/cta/booking-cta-link";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { WhatsAppAction } from "@/components/shared/whatsapp-action/WhatsAppAction";
import { IconExternal } from "@/lib/icons";
import type { BookingSource } from "@/components/shared/booking-form/booking-actions";

interface PartnerStripProps {
  client: {
    id: string;
    name: string;
    slug: string;
    /** As the partner stored it — the tab is dropped when there is no number. */
    phone?: string | null;
    description?: string | null;
    businessBrief?: string | null;
    slogan?: string | null;
    logoMedia?: { url: string; bunnyUrl: string | null; blurDataURL: string | null } | null;
  };
  cta?: {
    mode: "NONE" | "FORM" | "LINK";
    label?: string | null;
    url?: string | null;
    articleId?: string | null;
    source: BookingSource;
  };
}

/**
 * The partner, compact — the reader's «who stands behind this, and how do I reach them»,
 * kept reachable for the whole article instead of only at its end.
 *
 * Deliberately low-graphic. The full card lived in this rail before and was measured at 468px
 * of cover art, logo, verification badge, five social icons and an amber button; eyetracking
 * research on rail content is blunt about that shape — people have trained themselves to skip
 * it ("I saw that, but it looked like an ad, so I ignored it"), and the louder the graphics the
 * harder they skip. The same research says the remedy is a light-weight design that matches the
 * site's own content, so this is a 32px avatar, a name, one line of what they do, and ONE
 * action. The full card still runs under the article, where the reader has finished and has a
 * reason to act.
 */
export function PartnerStrip({ client, cta }: PartnerStripProps) {
  const credential =
    client.description?.trim() || client.businessBrief?.trim() || client.slogan?.trim() || null;

  return (
    /* Its own card, with a gap below it (Khalid, 19 Aug) — the partner is an identity, the
       contents card is a reading tool, and stacking them flush made one object out of two
       different kinds of thing. */
    <div className="relative overflow-hidden rounded-xl border border-border bg-card px-3 py-3">
      <div className="flex items-center gap-2.5">
        {/* Was `object-cover` at 32px — which crops a logo, and a logo is a name. */}
        <PartnerAvatar media={client.logoMedia} name={client.name} size="small" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/clients/${client.slug}`}
            className="flex items-center gap-1 text-[13px] font-semibold leading-tight text-foreground hover:text-primary"
          >
            <span className="truncate">{client.name}</span>
            <VerifiedBadge className="size-3.5" label="شريك موثّق" />
          </Link>
          {credential && (
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-tight text-muted-foreground">
              {credential}
            </p>
          )}
        </div>
      </div>

      {/* One row, split in two (Khalid, 19 Aug): book, or ask first. A reader who is ready
          books; a reader with one question left would have bounced off a single booking
          button, and the chat is where that question gets asked. WhatsApp drops out when the
          partner has no number, and the booking button takes the whole width again. */}
      {cta?.mode === "FORM" && (
        <div className="mt-2.5 flex items-stretch gap-2">
          <BookingCtaLink
            clientSlug={client.slug}
            articleId={cta.articleId}
            source={cta.source}
            label={cta.label}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground ring-1 ring-inset ring-white/25 transition-opacity hover:opacity-90"
          />
          <WhatsAppAction
            phone={client.phone}
            clientId={client.id}
            clientName={client.name}
            source={cta.source}
            articleId={cta.articleId}
            variant="split"
            label="تواصل"
          />
        </div>
      )}
      {cta?.mode === "LINK" && cta.url && (
        <CtaTrackedLink
          href={cta.url}
          label={cta.label?.trim() || "تسوّق الآن"}
          type="LINK"
          articleId={cta.articleId ?? undefined}
          clientId={client.id}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground ring-1 ring-inset ring-white/25 transition-opacity hover:opacity-90"
        >
          <IconExternal className="h-4 w-4" />
          {cta.label?.trim() || "تسوّق الآن"}
        </CtaTrackedLink>
      )}
    </div>
  );
}
