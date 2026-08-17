import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { IconAdd, IconChevronRight } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";

const text = messages.becomePartner;

interface PartnerInviteCardProps {
  /** Where this card sits — reported with the click so the invite can be compared across rails. */
  source: string;
}

/**
 * «صِر شريكاً في مدونتي» — the gradient banner that used to close `/clients`, folded into
 * the rail as one more card (Khalid, 2026-08-16); promoted to app-shared on 2026-08-17
 * when `/modonty` became its second rail. It wears the shared LinkCard's exact shape, but
 * cannot BE a LinkCard: this one leaves the site and has to be counted, so it goes
 * through CtaTrackedLink. Keep the classes in step with
 * `components/shared/link-card/LinkCard.tsx` — that file is the visual source of truth.
 */
export function PartnerInviteCard({ source }: PartnerInviteCardProps) {
  return (
    <CtaTrackedLink
      href="https://www.jbrseo.com"
      target="_blank"
      rel="noopener noreferrer"
      label={`${source} — become a partner`}
      type="BANNER"
      className="group flex items-center gap-3 rounded-lg bg-card p-3 ring-1 ring-primary/10 transition-[box-shadow,transform] sm:hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.98]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <IconAdd className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{text.title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{text.subtitle}</span>
      </span>
      <IconChevronRight className="h-4 w-4 shrink-0 text-primary rtl:rotate-180" aria-hidden />
    </CtaTrackedLink>
  );
}
