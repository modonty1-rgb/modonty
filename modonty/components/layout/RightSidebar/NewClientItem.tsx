import Link from "@/components/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NewClientItemProps {
  clientName: string;
  clientSlug: string;
  clientLogo?: string;
  industry?: string;
}

export function NewClientItem({ clientName, clientSlug, clientLogo, industry }: NewClientItemProps) {
  return (
    <Link href={`/clients/${clientSlug}`} className="flex items-center gap-3 hover:bg-muted/50 py-0.5 px-1 rounded transition-colors">
      <Avatar className="h-7 w-7 shrink-0 rounded-full overflow-hidden">
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
        <p className="text-xs font-medium text-foreground truncate">{clientName}</p>
        {industry && (
          <span className="text-xs text-muted-foreground truncate block">{industry}</span>
        )}
      </div>
    </Link>
  );
}
