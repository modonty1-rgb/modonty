import Link from "@/components/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NewClientItemProps {
  title: string;
  client: string;
  clientLogo?: string;
  slug: string;
}

export function NewClientItem({ title, client, clientLogo, slug }: NewClientItemProps) {
  return (
    <Link href={`/articles/${slug}`} className="flex items-center gap-3 hover:bg-muted/50 py-0.5 px-1 rounded transition-colors">
      <Avatar className="h-7 w-7 shrink-0 rounded-full overflow-hidden">
        <AvatarImage
          src={clientLogo}
          alt={client}
          className="object-cover"
          loading="lazy"
          decoding="async"
        />
        <AvatarFallback className="rounded-full text-[10px] font-medium text-muted-foreground bg-muted">
          {client?.slice(0, 1) ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{client}</p>
        <h3 className="text-xs text-muted-foreground truncate">{title}</h3>
      </div>
    </Link>
  );
}
