import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { IconVerified } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import { getPlatformCounts } from "@/lib/queries/get-platform-counts";
import { Fact } from "@/components/shared/about-card/Fact";

const text = messages.clients.trustCard;

/**
 * Top of the partners rail — the directory's own answer to «why trust anyone on this list?»
 *
 * UNIFIED 24 Aug 2026 (Khalid: «unify it»). It used to carry four bullets — «سجل تجاري
 * نشوفه · تعرف مين وراه · مقالات بأسماء حقيقية · تحجز وتشتري على طول» — the same promise
 * shape ABOUTCARD replaced on the homepage. Now it shares `AboutCard`'s anatomy exactly:
 * three live facts, one trust line, one outline CTA — and the same `Fact` tile, so the two
 * cards cannot drift apart again.
 *
 * The numbers are the same live counts, read differently: here «٢٩» is not a headcount but
 * twenty-nine commercial registers actually on file — which is what this page's visitor is
 * asking about. The CTA still goes to `/trust`, where the process is spelled out.
 */
export async function TrustCard() {
  const { partners, industries } = await getPlatformCounts();

  return (
    <section aria-labelledby="trust-card-heading" className="rounded-lg bg-card p-3 ring-1 ring-primary/10 lg:p-4">
      <h2 id="trust-card-heading" className="flex items-center gap-1.5 text-base font-medium leading-snug text-link">
        <ModontyTrustMark className="h-5 w-5 shrink-0" />
        {text.title}
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text.subtitle}</p>

      <div className="mt-2.5 grid grid-cols-3 gap-2 lg:mt-3">
        <Fact value={partners} label={text.factPartners} />
        <Fact value={industries} label={text.factIndustries} />
        <Fact value={text.namedValue} label={text.factNamed} />
      </div>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] leading-tight text-action-listen">
        <IconVerified className="size-3.5 shrink-0" aria-hidden />
        {text.trustLine}
      </p>

      <Link href="/trust" className={buttonVariants({ variant: "outline", className: "mt-3 min-h-11 w-full lg:mt-4" })}>
        {text.howWeVerifyButton}
      </Link>
    </section>
  );
}
