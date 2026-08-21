import Link from "next/link";
import { PartnerCardMobile } from "@/components/shared/partner-card/PartnerCardMobile";
import { AccentHeading } from "@/components/shared/accent-heading/AccentHeading";
import type { ClientListItem } from "@/lib/queries/get-clients-list";

/** Enough to answer «مين يقدّم هذا؟» on a phone without a full directory dump. */
const MAX_VISIBLE = 8;

interface PartnersGridMobileProps {
  partners: ClientListItem[];
  /** Same heading the rail shows — «كل الشركاء» or one field's. */
  heading: string;
  browseAllHref: string;
  /** Inside the context strip's collapse — the strip already names the field, so no heading. */
  embedded?: boolean;
}

/**
 * The field's partners on a phone — the SAME `PartnerCardMobile` the `/clients` directory
 * uses (Khalid, 21 Aug: «show the clients in this industry, the same style»), so a partner
 * looks identical wherever the visitor meets him: logo, name with the verified mark, one
 * trust line, one action, and the premium bar when he pays for the spotlight.
 *
 * Mobile only — ≥1024px the `PartnersRail` shows the full cards instead.
 */
export function PartnersGridMobile({ partners, heading, browseAllHref, embedded }: PartnersGridMobileProps) {
  if (partners.length === 0) return null;
  const visible = [...partners].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, MAX_VISIBLE);
  return (
    <section aria-label="الشركاء">
      {!embedded && <AccentHeading size="title">{heading}</AccentHeading>}
      <ul className={embedded ? "space-y-2.5" : "mt-3 space-y-2.5"}>
        {visible.map((partner) => (
          <li key={partner.id}>
            <PartnerCardMobile partner={partner} />
          </li>
        ))}
      </ul>
      {partners.length > MAX_VISIBLE && (
        <Link href={browseAllHref} className="mt-3 block text-center text-sm font-medium text-link hover:underline">
          كل الشركاء ←
        </Link>
      )}
    </section>
  );
}
