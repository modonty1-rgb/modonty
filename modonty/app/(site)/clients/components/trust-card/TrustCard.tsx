import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { messages } from "@/lib/i18n/messages";

const text = messages.clients.trustCard;

/**
 * Top of the partners rail — the page's own version of the homepage AboutCard: same
 * skeleton (title · line · 2×2 bullets · outline CTA) and the same height, so the two
 * rails start level. It answers the first question the directory raises: why trust
 * anyone on this list?
 */
export function TrustCard() {
  return (
    <section aria-labelledby="trust-card-heading" className="rounded-lg bg-card p-3 ring-1 ring-primary/10 lg:p-4">
      <h2 id="trust-card-heading" className="flex items-center gap-1.5 text-base font-medium leading-snug text-link">
        <ModontyTrustMark className="h-5 w-5 shrink-0" />
        {text.title}
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text.subtitle}</p>
      <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 lg:mt-3 lg:gap-y-2">
        {text.checklist.map((point) => (
          <li key={point} className="flex items-start gap-1.5 text-[11px] font-normal leading-4 text-foreground/90">
            <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
            {point}
          </li>
        ))}
      </ul>
      <Link href="/trust" className={buttonVariants({ variant: "outline", className: "mt-3 min-h-11 w-full lg:mt-4" })}>
        {text.howWeVerifyButton}
      </Link>
    </section>
  );
}
