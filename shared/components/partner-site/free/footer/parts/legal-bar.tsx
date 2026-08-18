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
        <a href={data.privacyHref ?? "/legal/privacy-policy"} className="transition-colors hover:text-foreground">سياسة الخصوصية</a>
        <a href="https://www.modonty.com" className="transition-colors hover:text-foreground">موقع مبني على مدونتي</a>
      </span>
    </div>
  );
}
