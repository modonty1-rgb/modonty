import { SiteLink } from "../../parts/site-link";
import { Mail, Phone } from "lucide-react";

import { WhatsAppIcon } from "../../../icons/whatsapp-icon";
import { cn } from "../../../../lib/utils/index";
import { BrandLogo } from "../../parts/brand-logo";
import { VerifiedBadge } from "../../parts/verified-badge";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { HeaderBar } from "./parts/header-bar";
import { NavLinks } from "./parts/nav-links";
import { navFit } from "./parts/nav-fit";
import { MobileMenu } from "./parts/mobile-menu";
import type { HeaderData } from "./header-data";

/** «شريط الخدمة» — a 36px utility bar in the brand colour (phone · email · WhatsApp) over the classic bar. */
export function UtilityHeader({ data }: { data: HeaderData }) {
  const fit = navFit(data.links, { secondRow: true });
  const brand = data.primaryColor ? { backgroundColor: data.primaryColor } : undefined;
  return (
    <header className="relative border-b bg-background">
      {/* لون الشريك يحمل أبيض (اللوحة مقيسة)، والافتراضي يستعمل زوج التوكن: الأبيض اليدوي
          على `bg-primary` قِيس ٣٫٦٨:١ — تحت حدّ WCAG 1.4.3 لنصّ ١٢px. */}
      <div className={cn(data.primaryColor ? "text-white" : "bg-primary text-primary-foreground")} style={brand}>
        <div className="mx-auto flex max-w-[1128px] items-center justify-between px-6 text-sm max-lg:min-h-11 md:h-9 md:text-xs">
          <div className="flex items-center gap-6">
            {data.phone && (
              // الشريط ٣٦px، فالرابط داخله كان هدفاً ١٦px ارتفاعاً على الجوّال (المقيس
              // ١٦×٩٩) — دون حدّ Apple HIG ٤٤. يتمدّد لملء الشريط على الجوّال وحده.
              <SiteLink href={`tel:${data.phone}`} className="flex items-center gap-1.5 max-lg:min-h-11">
                <Phone className="h-3.5 w-3.5" aria-hidden /> <span dir="ltr">{data.phone}</span>
              </SiteLink>
            )}
            {data.email && (
              <SiteLink href={`mailto:${data.email}`} className="hidden items-center gap-1.5 sm:flex">
                <Mail className="h-3.5 w-3.5" aria-hidden /> {data.email}
              </SiteLink>
            )}
          </div>
          {/* Was a plain <span> styled like an action — it looked tappable and did nothing (4 Oct 2026).
              Now the real link; hidden when the partner has no WhatsApp, inert in the preview. */}
          {data.whatsappHref ? (
            data.whatsappHref.startsWith("#") ? (
              <span inert className="flex items-center gap-1.5">
                <WhatsAppIcon size={14} /> راسلنا على واتساب
              </span>
            ) : (
              <SiteLink href={data.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 max-lg:min-h-11">
                <WhatsAppIcon size={14} /> راسلنا على واتساب
              </SiteLink>
            )
          ) : null}
        </div>
      </div>
      <HeaderBar>
        <SiteLink href={data.homeHref} className="min-w-0 max-lg:flex max-lg:min-h-11 max-lg:items-center lg:inline-flex lg:min-h-6 lg:items-center">
          <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} size="standard" />
        </SiteLink>
        {data.verified ? <VerifiedBadge /> : null}
        <NavLinks links={data.links} className={fit.nav} />
        <div className="flex items-center gap-2">
          <WhatsAppButton href={data.whatsappHref} className="hidden md:inline-flex" />
          <MobileMenu data={data} hideAt={fit.burger} />
        </div>
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
