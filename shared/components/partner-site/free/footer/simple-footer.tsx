import { SiteLink } from "../../parts/site-link";
import { BrandLogo } from "../../parts/brand-logo";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { SocialLinks } from "../../social-links";
import { FooterWrap } from "./parts/footer-wrap";
import { LegalBar } from "./parts/legal-bar";
import type { FooterData } from "./footer-data";

/** «المختصر» — one row: logo · page links · social + phone + WhatsApp — then the legal bar. */
export function SimpleFooter({ data, preview = false }: { data: FooterData; preview?: boolean }) {
  return (
    <footer className="bg-muted/30">
      <FooterWrap className="pt-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SiteLink href={data.homeHref} className="min-w-0">
            <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} size="standard" />
          </SiteLink>
          {/* Was `hidden md:flex` — on a phone this footer had no page links at all (4 Oct 2026). */}
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-1 text-sm text-muted-foreground">
            {data.pages.map((p) => (
              <li key={p.href}>
                <SiteLink href={p.href} className="transition-colors hover:text-foreground max-lg:inline-flex max-lg:min-h-11 max-lg:items-center lg:inline-flex lg:min-h-6 lg:items-center">{p.label}</SiteLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-6">
            <SocialLinks urls={data.socialLinks} inert={preview} />
            {data.phone && (
              // هدف ٤٤ على الجوّال: المقيس كان ٢٠×٩٢ — رقم الهاتف في الذيل هو نداء
              // الفعل الأخير في الصفحة، ولا يُضغط بإبهام على عشرين بكسلاً (Apple HIG).
              <SiteLink href={`tel:${data.phone}`} dir="ltr" className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground max-lg:min-h-11">
                {data.phone}
              </SiteLink>
            )}
            <WhatsAppButton href={data.whatsappHref} />
          </div>
        </div>
        <LegalBar data={data} />
      </FooterWrap>
    </footer>
  );
}
