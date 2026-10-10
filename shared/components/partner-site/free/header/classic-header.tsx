import { SiteLink } from "../../parts/site-link";
import { BrandLogo } from "../../parts/brand-logo";
import { VerifiedBadge } from "../../parts/verified-badge";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { HeaderBar } from "./parts/header-bar";
import { NavLinks } from "./parts/nav-links";
import { navFit } from "./parts/nav-fit";
import { PhoneLine } from "./parts/phone-line";
import { MobileMenu } from "./parts/mobile-menu";
import type { HeaderData } from "./header-data";

/** «الأساسي» — logo start · links centre · phone + WhatsApp end. The most common bar. */
export function ClassicHeader({ data }: { data: HeaderData }) {
  const fit = navFit(data.links, { secondRow: true });
  return (
    <header className="relative border-b bg-background">
      <HeaderBar>
        <SiteLink href={data.homeHref} className="min-w-0 max-lg:flex max-lg:min-h-11 max-lg:items-center lg:inline-flex lg:min-h-6 lg:items-center">
          <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} />
        </SiteLink>
        {data.verified ? <VerifiedBadge /> : null}
        <NavLinks links={data.links} className={fit.nav} />
        <div className="hidden items-center gap-6 md:flex">
          <PhoneLine phone={data.phone} className="hidden lg:flex" />
          <WhatsAppButton href={data.whatsappHref} />
        </div>
        <MobileMenu data={data} hideAt={fit.burger} />
      </HeaderBar>
      {fit.row && (
        <div className={fit.row}>
          <div className="mx-auto flex h-11 max-w-[1128px] items-center px-6">
            <NavLinks links={data.links} gap="gap-8" />
          </div>
        </div>
      )}
    </header>
  );
}
