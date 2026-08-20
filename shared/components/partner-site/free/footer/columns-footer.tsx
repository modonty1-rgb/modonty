import { BrandLogo } from "../../parts/brand-logo";
import { SocialLinks } from "../../social-links";
import { ContactColumn } from "./parts/contact-column";
import { FooterWrap } from "./parts/footer-wrap";
import { LegalBar } from "./parts/legal-bar";
import { LinkColumn } from "./parts/link-column";
import type { FooterData } from "./footer-data";

/**
 * «الأعمدة» — logo + blurb + social on the start, then link columns and contact. The
 * standard 4-column footer. Only columns with content get a track, so an empty services
 * list never leaves a hole.
 */
export function ColumnsFooter({ data, preview = false }: { data: FooterData; preview?: boolean }) {
  const columns = [
    data.services.length > 0 ? <LinkColumn key="services" title="خدماتنا" links={data.services} /> : null,
    <LinkColumn key="pages" title="الصفحات" links={data.pages} />,
    <ContactColumn key="contact" data={data} inert={preview} />,
  ].filter(Boolean);

  return (
    <footer className="bg-muted/30">
      <FooterWrap>
        <div className="grid gap-8" style={{ gridTemplateColumns: `1.6fr ${columns.map(() => "1fr").join(" ")}` }}>
          <div className="space-y-4">
            <a href={data.homeHref} className="inline-block">
              <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} size="standard" />
            </a>
            {data.description && <p className="line-clamp-3 max-w-xs text-sm leading-6 text-muted-foreground">{data.description}</p>}
            <SocialLinks urls={data.socialLinks} inert={preview} />
          </div>
          {columns}
        </div>
        <LegalBar data={data} />
      </FooterWrap>
    </footer>
  );
}
