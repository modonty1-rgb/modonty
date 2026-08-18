import { BrandLogo } from "../../parts/brand-logo";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { SocialLinks } from "../../social-links";
import { FooterWrap } from "./parts/footer-wrap";
import { LegalBar } from "./parts/legal-bar";
import type { FooterData } from "./footer-data";

/** «المركزي» — everything centred: logo · links row · contact row · social · legal. No columns. */
export function CenteredFooter({ data, preview = false }: { data: FooterData; preview?: boolean }) {
  return (
    <footer className="bg-muted/30">
      <FooterWrap>
        <div className="flex flex-col items-center gap-6 text-center">
          <a href={data.homeHref}>
            <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} size={44} />
          </a>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {data.pages.map((p) => (
              <li key={p.href}>
                <a href={p.href} className="transition-colors hover:text-foreground">{p.label}</a>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {data.phone && <a href={`tel:${data.phone}`} dir="ltr" className="transition-colors hover:text-foreground">{data.phone}</a>}
            {data.email && <a href={`mailto:${data.email}`} className="transition-colors hover:text-foreground">{data.email}</a>}
            <WhatsAppButton href={data.whatsappHref} variant="text" />
          </div>
          <SocialLinks urls={data.socialLinks} inert={preview} />
        </div>
        <LegalBar data={data} centered />
      </FooterWrap>
    </footer>
  );
}
