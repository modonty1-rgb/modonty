import Link from "next/link";
import { OptimizedImage } from "@modonty/shared/components/optimized-image";
import { IconPhone } from "@/lib/icons";
import type { PartnerSite } from "../../helpers/get-partner-site";
import { buildPartnerNav } from "./partner-nav-items";

interface PartnerHeaderProps {
  site: PartnerSite;
}

/**
 * The partner's own header — logo · name · one-line tagline · his pages · his phone ·
 * the request button. It reads as HIS site: nothing of modonty's navigation is here
 * (that lives in the thin PlatformBar above). Sticky, so the phone and the request
 * button travel with the visitor.
 */
export function PartnerHeader({ site }: PartnerHeaderProps) {
  const nav = buildPartnerNav(site);
  const home = nav[0].href;
  const tagline = [site.industry?.name, site.addressCity].filter(Boolean).join(" · ");

  return (
    <header className="border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1216px] items-center gap-6 px-4">
        <Link href={home} className="flex min-w-0 items-center gap-3">
          {site.logoMedia ? (
            <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-border">
              <OptimizedImage media={site.logoMedia} alt="" fill sizes="44px" className="object-cover" />
            </span>
          ) : (
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-lg font-bold text-white">
              {site.name.slice(0, 1)}
            </span>
          )}
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-bold text-foreground">{site.name}</span>
            {tagline ? <span className="block truncate text-xs text-muted-foreground">{tagline}</span> : null}
          </span>
        </Link>

        <nav aria-label="أقسام موقع الشريك" className="ms-4 hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-3">
          {site.phone ? (
            <a href={`tel:${site.phone}`} dir="ltr" className="hidden items-center gap-2 text-sm text-foreground lg:flex">
              <IconPhone className="h-4 w-4 text-muted-foreground" aria-hidden />
              {site.phone}
            </a>
          ) : null}
          <Link
            href={`${home}#request`}
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-white transition-[filter,transform] hover:brightness-110 motion-safe:active:scale-[0.98]"
          >
            اطلب اتصالاً
          </Link>
        </div>
      </div>
    </header>
  );
}
