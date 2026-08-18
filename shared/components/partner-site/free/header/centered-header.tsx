import { BrandLogo } from "../../parts/brand-logo";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { NavLinks } from "./parts/nav-links";
import { PhoneLine } from "./parts/phone-line";
import { MobileMenu } from "./parts/mobile-menu";
import type { HeaderData } from "./header-data";

/**
 * «المركزي» — two rows: logo in the true centre (phone start · WhatsApp text link end),
 * then the links centred under a hairline. Three grid columns, no absolute positioning,
 * so a long phone number can never overlap the logo.
 */
export function CenteredHeader({ data }: { data: HeaderData }) {
  return (
    <header className="relative border-b bg-background">
      <div className="mx-auto grid h-16 max-w-[1128px] grid-cols-[1fr_auto_1fr] items-center px-6">
        <PhoneLine phone={data.phone} className="hidden justify-self-start text-muted-foreground lg:flex" />
        <a href={data.homeHref} className="min-w-0">
          <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} size={40} />
        </a>
        <div className="flex items-center justify-self-end">
          <WhatsAppButton href={data.whatsappHref} variant="text" className="hidden md:inline-flex" />
          <MobileMenu data={data} />
        </div>
      </div>
      <div className="hidden border-t md:block">
        <div className="mx-auto flex h-11 max-w-[1128px] items-center justify-center px-6">
          <NavLinks links={data.links} gap="gap-10" />
        </div>
      </div>
    </header>
  );
}
