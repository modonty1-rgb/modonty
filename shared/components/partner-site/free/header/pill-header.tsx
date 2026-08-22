import { Phone } from "lucide-react";

import { cn } from "../../../../lib/utils/index";
import { BrandLogo } from "../../parts/brand-logo";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { HeaderBar } from "./parts/header-bar";
import { MobileMenu } from "./parts/mobile-menu";
import type { HeaderData } from "./header-data";

/** «الكبسولة» — links inside a bordered pill in the centre; two round actions at the end (phone · WhatsApp). */
export function PillHeader({ data }: { data: HeaderData }) {
  const current = data.links[0]?.href;
  return (
    <header className="relative bg-background">
      <HeaderBar>
        <a href={data.homeHref} className="min-w-0 max-md:flex max-md:min-h-11 max-md:items-center">
          <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} />
        </a>
        <nav className="hidden items-center rounded-full border p-1 md:flex" aria-label="الصفحات">
          {data.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={l.href === current ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                l.href === current ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {data.phone && (
            <a
              href={`tel:${data.phone}`}
              aria-label="اتصال"
              className={cn("grid h-10 w-10 place-items-center rounded-full border", !data.primaryColor && "text-primary")}
              style={data.primaryColor ? { color: data.primaryColor } : undefined}
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
          <WhatsAppButton href={data.whatsappHref} variant="round" className="hidden md:grid" />
          <MobileMenu data={data} />
        </div>
      </HeaderBar>
    </header>
  );
}
