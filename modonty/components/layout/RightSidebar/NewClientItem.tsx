import Link from "@/components/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconFilter } from "@/lib/icons";
import { PartnerRow } from "./PartnerRow";

interface NewClientItemProps {
  clientName: string;
  clientSlug: string;
  clientLogo?: string;
  industry?: string;
  articleCount?: number;
}

export function NewClientItem({ clientName, clientSlug, clientLogo, industry, articleCount = 0 }: NewClientItemProps) {
  return (
    <PartnerRow slug={clientSlug}>
      {/* Primary action — visit the partner profile */}
      <Link href={`/clients/${clientSlug}`} className="flex flex-1 min-w-0 items-start gap-3 py-1 px-1">
        <Avatar className="h-7 w-7 shrink-0 rounded-full overflow-hidden mt-0.5">
          <AvatarImage
            src={clientLogo}
            alt={clientName}
            className="object-cover"
            loading="lazy"
            decoding="async"
          />
          <AvatarFallback className="rounded-full text-[10px] font-medium bg-primary text-primary-foreground">
            {clientName?.slice(0, 1) ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground break-words">{clientName}</p>
          {industry && (
            <span className="text-xs text-muted-foreground truncate block">{industry}</span>
          )}
        </div>
      </Link>
      {/* Secondary action — filter the home feed to this partner's articles (hidden when 0) */}
      {articleCount > 0 && (
        <Link
          href={`/?client=${encodeURIComponent(clientSlug)}`}
          aria-label={`اعرض مقالات ${clientName} في الموجز (${articleCount})`}
          title={`مقالات ${clientName}`}
          className="me-1 mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        >
          <IconFilter className="h-3.5 w-3.5" aria-hidden />
          <span className="tabular-nums">{new Intl.NumberFormat("ar-SA").format(articleCount)}</span>
        </Link>
      )}
    </PartnerRow>
  );
}
