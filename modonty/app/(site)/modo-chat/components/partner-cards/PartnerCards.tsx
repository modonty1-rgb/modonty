import Link from "next/link";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import { Card } from "@/components/ui/card";
import { IconCalendar, IconChevronLeft, IconClients, IconMapPin } from "@/lib/icons";

export interface SuggestedPartner {
  name: string;
  slug: string;
  /** The partner accepts bookings or has a contact action configured. */
  canBook: boolean;
  /** Why this one, in the visitor's language — the article, or what he does. */
  whyRecommended: string;
  logo?: string | null;
  city?: string | null;
  /** A named licence or accreditation. */
  credential?: string | null;
  /** His official papers were checked, even without a named credential. */
  hasVerifiedPapers?: boolean;
}

/**
 * The partners behind an answer, as something the visitor can act on.
 *
 * Modo used to name a doctor inside the prose and stop there — measured live 2026-08-18, it
 * recommended «د. عمرو مصطفى» with no link and no way to book, so an answer that did its job
 * produced nothing for the partner who paid for the placement.
 *
 * The card carries a face, a place and a verification mark because the question underneath
 * «مين تنصحني؟» is «أثق فيه ليه؟» — a bare name in a box answers neither. Booking is the one
 * primary action, full width; the profile link is quiet text beside it, so the two stop
 * competing the way two equal buttons did.
 */
export function PartnerCards({ partners }: { partners: SuggestedPartner[] }) {
  if (partners.length === 0) return null;

  return (
    <div className="mt-3 space-y-2" dir="rtl">
      <p className="text-xs font-medium text-muted-foreground">
        {partners.length === 1 ? "الشريك اللي يقدر يخدمك:" : "شركاء يقدرون يخدمونك:"}
      </p>

      {partners.map((partner) => {
        const trustLine = partner.credential?.trim()
          || (partner.hasVerifiedPapers ? "أوراقه الرسمية مفحوصة" : null);

        return (
          <Card key={partner.slug} className="overflow-hidden p-0">
            <div className="flex items-start gap-3 p-3">
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                {partner.logo ? (
                  <OptimizedImage
                    media={asMedia(partner.logo, partner.name)}
                    alt=""
                    fill
                    sizes="44px"
                    loading="lazy"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <IconClients className="h-5 w-5 text-muted-foreground" aria-hidden />
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold leading-snug text-foreground">
                  <span className="truncate">{partner.name}</span>
                  {(partner.hasVerifiedPapers || partner.credential) && (
                    <VerifiedBadge className="h-4 w-4" label="شريك موثّق" />
                  )}
                </p>

                {(partner.city || trustLine) && (
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    {partner.city && (
                      <span className="inline-flex items-center gap-1">
                        <IconMapPin className="h-3 w-3 shrink-0" aria-hidden />
                        {partner.city}
                      </span>
                    )}
                    {trustLine && <span className="text-foreground/70">{trustLine}</span>}
                  </p>
                )}

                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {partner.whyRecommended}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-border bg-muted/30 px-3 py-2.5">
              {partner.canBook && (
                <Link
                  href={`/clients/${partner.slug}/book`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <IconCalendar className="h-4 w-4 shrink-0" aria-hidden />
                  احجز موعدك
                </Link>
              )}
              <Link
                href={`/clients/${partner.slug}`}
                className={`inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground ${partner.canBook ? "" : "flex-1 justify-center"}`}
              >
                شوف صفحته
                <IconChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
