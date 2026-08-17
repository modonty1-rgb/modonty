import Link from "next/link";
import { PartnerCard } from "@/components/shared/partner-card/PartnerCard";
import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClientListItem } from "@/lib/queries/get-clients-list";

/** Rail cards, not the full directory — enough to answer «مين يقدّم هذا؟» without leaving the page. */
const MAX_VISIBLE = 6;

interface PartnersRailProps {
  partners: ClientListItem[];
  /** Heading line — differs between the base page («كل الشركاء») and one field's page. */
  heading: string;
  /** Where «كل الشركاء» sends the visitor — the full directory, filtered or not. */
  browseAllHref: string;
  className?: string;
}

/**
 * Who provides this — the same partner card as `/clients`, `/booking` and `/shop`
 * (Khalid, 2026-08-16: reusable everywhere). Capped to keep the rail from out-growing the
 * article feed beside it; the caller decides both the heading and where «كل الشركاء»
 * leads, since the base `/industries` page and one field's page mean different things by it.
 */
export function PartnersRail({ partners, heading, browseAllHref, className }: PartnersRailProps) {
  if (partners.length === 0) return null;

  // Featured partners lead the rail — the same priority `/clients` gives them, so a
  // partner who paid for the spotlight is never bumped off a capped list by an
  // alphabetically-earlier name.
  const visible = [...partners].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, MAX_VISIBLE);

  return (
    <StickyRail
      label="الشركاء"
      className={cn("hidden w-[300px] shrink-0 self-start lg:sticky lg:block", className)}
    >
      <div className="space-y-4">
        <h2 className="px-1 text-xs font-medium text-muted-foreground">{heading}</h2>
        {visible.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
        {partners.length > MAX_VISIBLE && (
          <Link
            href={browseAllHref}
            className={buttonVariants({ variant: "outline", className: "min-h-11 w-full" })}
          >
            كل الشركاء ({partners.length.toLocaleString("ar-SA")})
          </Link>
        )}
      </div>
    </StickyRail>
  );
}
