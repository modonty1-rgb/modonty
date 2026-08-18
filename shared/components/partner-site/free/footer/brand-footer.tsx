import { OptimizedImage, asMedia } from "../../../optimized-image";
import { WhatsAppIcon } from "../../../icons/whatsapp-icon";
import { cn } from "../../../../lib/utils/index";
import { WHATSAPP_GREEN } from "../../parts/whatsapp-button";
import { ContactColumn } from "./parts/contact-column";
import { FooterWrap } from "./parts/footer-wrap";
import { LegalBar } from "./parts/legal-bar";
import { LinkColumn } from "./parts/link-column";
import type { FooterData } from "./footer-data";

/** «بلوك الهوية» — a brand-colour band (logo · closing line · WhatsApp) over the standard columns. */
export function BrandFooter({ data, preview = false }: { data: FooterData; preview?: boolean }) {
  const cta = (
    <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold" style={{ color: WHATSAPP_GREEN }}>
      <WhatsAppIcon size={16} /> واتساب
    </span>
  );
  return (
    <footer className="bg-muted/30">
      <div className={cn("text-white", !data.primaryColor && "bg-primary")} style={data.primaryColor ? { backgroundColor: data.primaryColor } : undefined}>
        <div className="mx-auto flex max-w-[1128px] flex-wrap items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-4">
            {data.logoUrl && (
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-white">
                <OptimizedImage media={asMedia(data.logoUrl, data.name)} alt="" fill sizes="avatar" className="object-contain" />
              </span>
            )}
            <div className="leading-tight">
              <p className="text-lg font-bold">جاهز تبدأ مع {data.name}؟</p>
              <p className="mt-1 text-sm text-white/80">راسلنا الآن ونردّ عليك في نفس اليوم.</p>
            </div>
          </div>
          {data.whatsappHref ? (
            <a href={data.whatsappHref} target="_blank" rel="noopener noreferrer">{cta}</a>
          ) : (
            cta
          )}
        </div>
      </div>
      <FooterWrap className="pt-10">
        <div className="grid gap-8" style={{ gridTemplateColumns: data.services.length > 0 ? "1fr 1fr 1fr" : "1fr 1fr" }}>
          <LinkColumn title="خدماتنا" links={data.services} />
          <LinkColumn title="الصفحات" links={data.pages} />
          <ContactColumn data={data} social inert={preview} />
        </div>
        <LegalBar data={data} />
      </FooterWrap>
    </footer>
  );
}
