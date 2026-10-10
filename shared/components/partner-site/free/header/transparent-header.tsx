import { SiteLink } from "../../parts/site-link";
import { BrandLogo } from "../../parts/brand-logo";
import { VerifiedBadge } from "../../parts/verified-badge";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { HeaderBar } from "./parts/header-bar";
import { NavLinks } from "./parts/nav-links";
import { navFit } from "./parts/nav-fit";
import { MobileMenu } from "./parts/mobile-menu";
import type { HeaderData } from "./header-data";

/**
 * «الداكن» — a dark bar with white text and an outlined WhatsApp button (the header pattern
 * template galleries call "on brand background / dark"). Same on the site and in the console.
 */
export function TransparentHeader({ data }: { data: HeaderData }) {
  const fit = navFit(data.links);
  return (
    <header className="relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10" aria-hidden />
      <HeaderBar className="relative">
        <SiteLink href={data.homeHref} className="min-w-0 max-lg:flex max-lg:min-h-11 max-lg:items-center lg:inline-flex lg:min-h-6 lg:items-center">
          <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} light />
        </SiteLink>
        {data.verified ? <VerifiedBadge light /> : null}
        <NavLinks links={data.links} className={fit.nav} light />
        <div className="flex items-center gap-2">
          <WhatsAppButton href={data.whatsappHref} variant="outline-light" className="hidden md:inline-flex" />
          <MobileMenu data={data} light hideAt={fit.burger} />
        </div>
      </HeaderBar>
    </header>
  );
}
