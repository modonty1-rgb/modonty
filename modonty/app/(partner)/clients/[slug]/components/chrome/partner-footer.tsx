import Link from "next/link";
import { cacheLife } from "next/cache";
import { OptimizedImage } from "@modonty/shared/components/optimized-image";
import { ModontyMark } from "@/components/icons/modonty-mark";
import type { PartnerSite } from "../../helpers/get-partner-site";
import { buildPartnerNav } from "./partner-nav-items";

interface PartnerFooterProps {
  site: PartnerSite;
}

/** Read inside a cache scope: the current time is not allowed in a prerendered Server Component. */
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/**
 * The partner's own footer: who he is · his services · his pages · how to reach him ·
 * his legal line — and one quiet line that says the site is built on modonty.
 */
export async function PartnerFooter({ site }: PartnerFooterProps) {
  const YEAR = await currentYear();
  const nav = buildPartnerNav(site);
  const address = [site.addressStreet, site.addressNeighborhood, site.addressCity].filter(Boolean).join("، ");
  const legal = [site.legalName, site.legalForm].filter(Boolean).join(" — ");

  return (
    <footer className="mt-20 border-t border-border bg-card text-sm text-muted-foreground">
      <div className="mx-auto grid max-w-[1216px] gap-10 px-4 py-12 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            {site.logoMedia ? (
              <span className="relative size-10 overflow-hidden rounded-lg bg-white ring-1 ring-border">
                <OptimizedImage media={site.logoMedia} alt="" fill sizes="40px" className="object-cover" />
              </span>
            ) : null}
            <span className="text-base font-bold text-foreground">{site.name}</span>
          </div>
          {site.description ? <p className="mt-4 max-w-sm leading-relaxed line-clamp-3">{site.description.split("\n").filter(Boolean)[0]}</p> : null}
        </div>

        {site.services.length > 0 ? (
          <div>
            <p className="font-medium text-foreground">خدماته</p>
            <ul className="mt-3 space-y-2">
              {site.services.slice(0, 5).map((s) => (
                <li key={s.title}>{s.title}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <p className="font-medium text-foreground">الموقع</p>
          <ul className="mt-3 space-y-2">
            {nav.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-foreground">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-foreground">تواصل</p>
          <ul className="mt-3 space-y-2">
            {site.phone ? <li dir="ltr" className="text-end"><a href={`tel:${site.phone}`} className="hover:text-foreground">{site.phone}</a></li> : null}
            {site.email ? <li><a href={`mailto:${site.email}`} className="hover:text-foreground">{site.email}</a></li> : null}
            {address ? <li>{address}</li> : null}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1216px] flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-5 text-xs">
        <span>
          © {YEAR} {legal || site.name}
          {site.commercialRegistrationNumber ? <> · سجل تجاري <span dir="ltr">{site.commercialRegistrationNumber}</span></> : null}
        </span>
        <span className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 hover:text-foreground">
            موقع مبنيّ على <ModontyMark className="h-3.5 w-3.5 text-primary" aria-hidden /> <b className="font-medium text-foreground">مُدَوَّنَتِي</b>
          </Link>
          <Link href="/trust" className="hover:text-foreground">كيف نتأكّد؟</Link>
          <Link href="/legal/privacy-policy" className="hover:text-foreground">سياسة الخصوصية</Link>
        </span>
      </div>
    </footer>
  );
}
