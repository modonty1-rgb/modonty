import type { CSSProperties } from "react";

import { asMedia } from "../../../optimized-image";
import { PartnerAvatar } from "../../../partner-avatar/PartnerAvatar";
import { cn } from "../../../../lib/utils/index";
import { ContactColumn } from "./parts/contact-column";
import { FooterWrap } from "./parts/footer-wrap";
import { LegalBar } from "./parts/legal-bar";
import { LinkColumn } from "./parts/link-column";
import type { FooterData } from "./footer-data";

/**
 * «بلوك الهوية» — a brand-colour band (logo · name · tagline) over the standard columns.
 *
 * The band used to carry its own «مستعدّ للبدء…» line and a WhatsApp button — the same words and
 * the same button «النداء الأخير» had printed one band above it, on every page (4 Oct 2026).
 * The invitation belongs to the CTA; the footer band now only says whose site this is.
 */
export function BrandFooter({ data, preview = false }: { data: FooterData; preview?: boolean }) {
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
              <p className="text-lg font-bold">{data.name}</p>
              {data.tagline && <p className="mt-1 text-sm">{data.tagline}</p>}
            </div>
          </div>
        </div>
      </div>
      <FooterWrap className="pt-10">
        {/* Same fix as `columns-footer`: an inline `grid-template-columns` cannot be reached by
            a breakpoint, so three equal tracks stayed three on a 390px phone. The value moves to
            a custom property and a variant owns the property — stacked below 768, identical at
            and above it. */}
        <div
          className="grid grid-cols-2 gap-8 md:[grid-template-columns:var(--partner-footer-cols)] max-md:[&>*:last-child]:col-span-2"
          style={{ "--partner-footer-cols": data.services.length > 0 ? "1fr 1fr 1fr" : "1fr 1fr" } as CSSProperties}
        >
          {/* `LinkColumn` returns null on an empty list, and the track count already drops to two
              when there are no services — so rendering it unconditionally was safe by luck, not by
              design. Made explicit: children and tracks now agree by construction. */}
          {data.services.length > 0 && <LinkColumn title="خدماتنا" links={data.services} limit={6} />}
          <LinkColumn title="الصفحات" links={data.pages} />
          <ContactColumn data={data} social inert={preview} />
        </div>
        <LegalBar data={data} />
      </FooterWrap>
    </footer>
  );
}
