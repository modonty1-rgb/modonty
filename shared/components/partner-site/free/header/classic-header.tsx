import { BrandLogo } from "../../parts/brand-logo";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { HeaderBar } from "./parts/header-bar";
import { NavLinks } from "./parts/nav-links";
import { PhoneLine } from "./parts/phone-line";
import { MobileMenu } from "./parts/mobile-menu";
import type { HeaderData } from "./header-data";

/** «الأساسي» — logo start · links centre · phone + WhatsApp end. The most common bar. */
export function ClassicHeader({ data }: { data: HeaderData }) {
  return (
    <header className="relative border-b bg-background">
      <HeaderBar>
        <a href={data.homeHref} className="min-w-0 max-md:flex max-md:min-h-11 max-md:items-center">
          <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} />
        </a>
        <NavLinks links={data.links} className="hidden md:flex" />
        <div className="hidden items-center gap-6 md:flex">
          <PhoneLine phone={data.phone} className="hidden lg:flex" />
          <WhatsAppButton href={data.whatsappHref} />
        </div>
        <MobileMenu data={data} />
      </HeaderBar>
    </header>
  );
}
