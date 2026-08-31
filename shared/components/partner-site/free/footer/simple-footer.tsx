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
          <a href={data.homeHref} className="min-w-0">
            <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} size="standard" />
          </a>
          <ul className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {data.pages.map((p) => (
              <li key={p.href}>
                <a href={p.href} className="transition-colors hover:text-foreground">{p.label}</a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-6">
            <SocialLinks urls={data.socialLinks} inert={preview} />
            {data.phone && (
              // هدف ٤٤ على الجوّال: المقيس كان ٢٠×٩٢ — رقم الهاتف في الذيل هو نداء
              // الفعل الأخير في الصفحة، ولا يُضغط بإبهام على عشرين بكسلاً (Apple HIG).
              <a href={`tel:${data.phone}`} dir="ltr" className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground max-md:min-h-11">
                {data.phone}
              </a>
            )}
            <WhatsAppButton href={data.whatsappHref} />
          </div>
        </div>
        <LegalBar data={data} />
      </FooterWrap>
    </footer>
  );
}
