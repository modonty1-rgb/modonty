import { SiteLink } from "../../../parts/site-link";
import { cn } from "../../../../../lib/utils/index";
import type { FooterData } from "../footer-data";


/** © year · registration · privacy · «موقع مبني على مدونتي» — hairline above, 14px muted. */
export function LegalBar({ data, centered = false }: { data: FooterData; centered?: boolean }) {
  return (
    <div className={cn("mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-6 text-sm text-muted-foreground", centered ? "justify-center text-center" : "justify-between")}>
      <span>
        © {data.year} {data.name}
        {data.registrationNumber ? ` · سجل تجاري ${data.registrationNumber}` : ""}
      </span>
      <span className="flex items-center gap-6">
        {/* A partner without his own policy links modonty's — which is the one that applies, since
            modonty stores what his forms collect. The label now says whose it is: «سياسة الخصوصية»
            under the partner's name opened modonty's page without warning (4 Oct 2026). */}
        <SiteLink href={data.privacyHref ?? "/legal/privacy-policy"} className="transition-colors hover:text-foreground max-lg:inline-flex max-lg:min-h-11 max-lg:items-center lg:inline-flex lg:min-h-6 lg:items-center">{data.privacyHref ? "سياسة الخصوصية" : "سياسة خصوصية مدونتي"}</SiteLink>
        <SiteLink href="https://www.modonty.com" className="transition-colors hover:text-foreground max-lg:inline-flex max-lg:min-h-11 max-lg:items-center lg:inline-flex lg:min-h-6 lg:items-center">موقع مبني على مدونتي</SiteLink>
      </span>
    </div>
  );
}
