import Link from "next/link";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { IconArrowRight } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";

const text = messages.about.hero;

/**
 * The brand statement in one screen — mark, name, one honest sentence about what modonty
 * is for, then the two doors a visitor actually needs: read (`/industries`) or join
 * (become a partner). Blue-to-teal is the mark's own pairing (`ModontyTrustMark`'s navy
 * shield and teal border), so the hero reads as the same brand, not a new palette —
 * `--secondary` was tried first and rejected: it resolves to near-white in light mode,
 * which washes the banner out to a pale stripe instead of a brand gradient.
 */
export function AboutHero() {
  return (
    <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-primary/10">
      <div className="relative flex flex-col items-center gap-4 bg-gradient-to-bl from-primary to-accent px-6 py-14 text-center sm:py-20">
        <span className="grid size-20 place-items-center rounded-3xl bg-white/15 backdrop-blur-sm ring-1 ring-inset ring-white/25 sm:size-24">
          <ModontyMark className="h-11 w-11 text-white sm:h-14 sm:w-14" />
        </span>
        <p className="text-xs font-medium tracking-wide text-white/70">{text.eyebrow}</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{text.title}</h1>
        <p className="max-w-lg text-balance text-sm leading-7 text-white/85 sm:text-base">{text.tagline}</p>
      </div>

      <div className="flex flex-col items-center gap-3 p-5 sm:flex-row sm:justify-center">
        <Link
          href="/industries"
          className={buttonVariants({ size: "lg", className: "min-w-48 gap-2" })}
        >
          {text.explorePrimary}
          <IconArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
        </Link>
        <CtaTrackedLink
          href="https://www.jbrseo.com"
          target="_blank"
          rel="noopener noreferrer"
          label="About Hero — صِر شريكاً"
          type="BUTTON"
          className={buttonVariants({ variant: "outline", size: "lg", className: "min-w-48" })}
        >
          {text.becomePartnerSecondary}
        </CtaTrackedLink>
      </div>
    </section>
  );
}
