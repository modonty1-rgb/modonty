import { Mail, Phone } from "lucide-react";

import { WhatsAppIcon } from "../../../icons/whatsapp-icon";
import { cn } from "../../../../lib/utils/index";
import { BrandLogo } from "../../parts/brand-logo";
import { VerifiedBadge } from "../../parts/verified-badge";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { HeaderBar } from "./parts/header-bar";
import { NavLinks } from "./parts/nav-links";
import { MobileMenu } from "./parts/mobile-menu";
import type { HeaderData } from "./header-data";

/** «شريط الخدمة» — a 36px utility bar in the brand colour (phone · email · WhatsApp) over the classic bar. */
export function UtilityHeader({ data }: { data: HeaderData }) {
  const brand = data.primaryColor ? { backgroundColor: data.primaryColor } : undefined;
  return (
    <header className="relative border-b bg-background">
      {/* لون الشريك يحمل أبيض (اللوحة مقيسة)، والافتراضي يستعمل زوج التوكن: الأبيض اليدوي
          على `bg-primary` قِيس ٣٫٦٨:١ — تحت حدّ WCAG 1.4.3 لنصّ ١٢px. */}
      <div className={cn(data.primaryColor ? "text-white" : "bg-primary text-primary-foreground")} style={brand}>
        <div className="mx-auto flex max-w-[1128px] items-center justify-between px-6 text-xs max-md:min-h-11 md:h-9">
          <div className="flex items-center gap-6">
            {data.phone && (
              // الشريط ٣٦px، فالرابط داخله كان هدفاً ١٦px ارتفاعاً على الجوّال (المقيس
              // ١٦×٩٩) — دون حدّ Apple HIG ٤٤. يتمدّد لملء الشريط على الجوّال وحده.
              <a href={`tel:${data.phone}`} className="flex items-center gap-1.5 max-md:min-h-11">
                <Phone className="h-3.5 w-3.5" aria-hidden /> <span dir="ltr">{data.phone}</span>
              </a>
            )}
            {data.email && (
              <a href={`mailto:${data.email}`} className="hidden items-center gap-1.5 sm:flex">
                <Mail className="h-3.5 w-3.5" aria-hidden /> {data.email}
              </a>
            )}
          </div>
          <span className="flex items-center gap-1.5">
            <WhatsAppIcon size={14} /> راسلنا على واتساب
          </span>
        </div>
      </div>
      <HeaderBar>
        <a href={data.homeHref} className="min-w-0">
          <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} size="standard" />
        </a>
        <VerifiedBadge />
        <NavLinks links={data.links} className="hidden md:flex" />
        <div className="flex items-center gap-2">
          <WhatsAppButton href={data.whatsappHref} className="hidden md:inline-flex" />
          <MobileMenu data={data} />
        </div>
      </HeaderBar>
    </header>
  );
}
