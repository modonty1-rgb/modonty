import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { IconAdd } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

const text = messages.becomePartner;

interface BecomePartnerBannerProps {
  /** Where this banner sits — reported with the click, so a partner's invite CTA can be
   * compared across the pages it appears on (booking, shop, …). */
  source: string;
  className?: string;
}

/**
 * The invite to become a partner, as a full-width closer for a listing page — same
 * destination and message as the rail's `PartnerInviteCard`, drawn as a plain bordered
 * card instead of a gradient banner (Khalid, 2026-08-16: the gradient banner was retired
 * from `/clients` for the same reason). Belongs at the bottom of any partner listing —
 * the visitor just finished browsing partners, so «become one» reads as the next step,
 * not an interruption.
 */
export function BecomePartnerBanner({ source, className }: BecomePartnerBannerProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center sm:flex-row sm:justify-between sm:text-start",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <IconAdd className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">{text.title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{text.subtitle}</p>
        </div>
      </div>
      <CtaTrackedLink
        href="https://www.jbrseo.com"
        target="_blank"
        rel="noopener noreferrer"
        label={`${source} — ${text.cta}`}
        type="BANNER"
        className={buttonVariants({ className: "min-w-32 shrink-0" })}
      >
        {text.cta}
      </CtaTrackedLink>
    </section>
  );
}
