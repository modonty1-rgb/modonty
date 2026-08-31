import type { CSSProperties } from "react";

import { OptimizedImage, asMedia } from "../../../optimized-image";
import { PartnerAvatar } from "../../../partner-avatar/PartnerAvatar";
import { WhatsAppIcon } from "../../../icons/whatsapp-icon";
import { cn } from "../../../../lib/utils/index";
import { WHATSAPP_SURFACE } from "../../parts/whatsapp-button";
import { ContactColumn } from "./parts/contact-column";
import { FooterWrap } from "./parts/footer-wrap";
import { LegalBar } from "./parts/legal-bar";
import { LinkColumn } from "./parts/link-column";
import type { FooterData } from "./footer-data";

/** «بلوك الهوية» — a brand-colour band (logo · closing line · WhatsApp) over the standard columns. */
export function BrandFooter({ data, preview = false }: { data: FooterData; preview?: boolean }) {
  const cta = (
    <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold max-md:h-11" style={{ color: WHATSAPP_SURFACE }}>
      <WhatsAppIcon size={16} /> واتساب
    </span>
  );
  return (
    <footer className="bg-muted/30">
      {/* نفس قاعدة «النداء الأخير»: لون الشريك يحمل أبيض (اللوحة مقيسة ≥ ٤٫٥:١)،
          والافتراضي يستعمل زوج التوكن — الأبيض اليدوي كان ٣٫٦٨:١ في السمة الداكنة. */}
      <div className={cn(data.primaryColor ? "text-white" : "bg-primary text-primary-foreground")} style={data.primaryColor ? { backgroundColor: data.primaryColor } : undefined}>
        <div className="mx-auto flex max-w-[1128px] flex-wrap items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-4">
            <PartnerAvatar
              media={data.logoUrl ? asMedia(data.logoUrl, data.name) : null}
              name={data.name}
              size="standard"
            />
            <div className="leading-tight">
              <p className="text-lg font-bold">جاهز تبدأ مع {data.name}؟</p>
              <p className="mt-1 text-sm">راسلنا الآن ونردّ عليك في نفس اليوم.</p>
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
        {/* Same fix as `columns-footer`: an inline `grid-template-columns` cannot be reached by
            a breakpoint, so three equal tracks stayed three on a 390px phone. The value moves to
            a custom property and a variant owns the property — stacked below 768, identical at
            and above it. */}
        <div
          className="grid grid-cols-1 gap-8 md:[grid-template-columns:var(--partner-footer-cols)]"
          style={{ "--partner-footer-cols": data.services.length > 0 ? "1fr 1fr 1fr" : "1fr 1fr" } as CSSProperties}
        >
          {/* `LinkColumn` returns null on an empty list, and the track count already drops to two
              when there are no services — so rendering it unconditionally was safe by luck, not by
              design. Made explicit: children and tracks now agree by construction. */}
          {data.services.length > 0 && <LinkColumn title="خدماتنا" links={data.services} />}
          <LinkColumn title="الصفحات" links={data.pages} />
          <ContactColumn data={data} social inert={preview} />
        </div>
        <LegalBar data={data} />
      </FooterWrap>
    </footer>
  );
}
