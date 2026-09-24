import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { IconVerified } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import { getLatestPartners } from "@/lib/queries/get-latest-partners";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { PARTNER_SIGNUP_URL } from "@/constants";
import { SITE_LOCALE_GREGORIAN } from "@modonty/shared/lib/constants/locale";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";

const text = messages.clients.trustCard;
// بتوقيت الرياض صراحةً: السيرفر المحلّيّ (+٣) وفيرسل (UTC) كانا يطبعان يومين مختلفين لنفس الصفّ.
const JOINED = new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, { day: "numeric", month: "long", timeZone: "Asia/Riyadh" });

/**
 * Top of the partners rail — the answer to «why trust anyone here?»
 *
 * **No numbers since 24 Sep 2026** (Khalid: «أعتقد هذه ما تفيد الزائر»). Its three facts —
 * partners · articles · industries — moved to the site footer (`FooterStats`, same
 * `getPlatformCounts`), and on `/clients` the list header already says «٤٢ شريكاً في ٨ مجالات».
 * The promise line stays: it is the reason to trust. What replaces the numbers depends on
 * who is reading:
 *
 * - `home` — the reader came for articles: the three newest partners, by name and logo,
 *   each opening its page. A name can be checked; a count cannot. Plus the door into `/clients`.
 * - `directory` — the visitor is already in the list: how a partner gets verified, and the
 *   way in for a business that wants to be listed.
 */
export async function TrustCard({ variant = "home" }: { variant?: "home" | "directory" }) {
  const latest = variant === "home" ? await getLatestPartners(3) : [];

  return (
    <section aria-labelledby="trust-card-heading" className="rounded-lg bg-card p-3 ring-1 ring-primary/10 lg:p-4">
      <h2 id="trust-card-heading" className="flex items-center gap-1.5 text-base font-medium leading-snug text-link">
        <ModontyTrustMark className="h-5 w-5 shrink-0" />
        {text.title}
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text.subtitle}</p>

      {variant === "home" ? (
        <>
          {latest.length > 0 ? (
            <>
              <p className="mt-3 text-xs font-bold text-foreground/85">{text.joinedTitle}</p>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {latest.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/clients/${p.slug}`}
                      className="flex min-h-11 items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-2 transition-colors hover:bg-muted/40"
                    >
                      {p.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- a 34px partner logo from the CDN; next/image adds nothing here.
                        <img src={p.logo} alt="" width={34} height={34} className="size-[34px] shrink-0 rounded-md object-cover" loading="lazy" />
                      ) : (
                        <span className="grid size-[34px] shrink-0 place-items-center rounded-md bg-primary/15 text-sm font-bold text-link" aria-hidden>
                          {p.name.charAt(0)}
                        </span>
                      )}
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[12.5px] font-bold leading-tight">{p.name}</span>
                        <span className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                          {p.industry ? `${p.industry} · ` : ""}
                          {text.joinedPrefix} {JOINED.format(p.joinedAt)}
                        </span>
                      </span>
                      {/* علامةُ «موثّق» البراندينج — نفسُ ما بجانب اسم الشريك في المقال (`PartnerCard`). */}
                      {p.isVerified ? <VerifiedBadge className="ms-auto size-4" label={text.verifiedBadge} /> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] leading-tight text-action-listen">
            <IconVerified className="size-3.5 shrink-0" aria-hidden />
            {text.trustLine}
          </p>

          <Link href="/clients" className={buttonVariants({ variant: "outline", className: "mt-3 min-h-11 w-full lg:mt-4" })}>
            {text.discoverPartnersButton}
          </Link>
        </>
      ) : (
        <>
          <p className="mt-3 text-xs font-bold text-foreground/85">{text.verifyTitle}</p>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {[text.verifyRegister, text.verifyContact, text.verifyReview].map((line) => (
              <li key={line} className="flex items-start gap-1.5 text-xs leading-5">
                <IconVerified className="mt-0.5 size-3.5 shrink-0 text-action-listen" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <CtaTrackedLink
            href={PARTNER_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            label="Trust card — صِر شريكاً"
            type="LINK"
            className={buttonVariants({ className: "mt-3 min-h-11 w-full lg:mt-4" })}
          >
            {text.becomePartnerButton} <span aria-hidden="true">↗</span>
          </CtaTrackedLink>
        </>
      )}
    </section>
  );
}
