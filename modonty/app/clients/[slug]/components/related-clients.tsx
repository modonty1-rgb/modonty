import Link from "@/components/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2 } from "lucide-react";

interface RelatedClient {
  id: string;
  name: string;
  slug: string;
  legalName?: string | null;
  logoMedia?: { url: string } | null;
  _count: {
    articles: number;
  };
}

interface RelatedClientsProps {
  clients: RelatedClient[];
}

export function RelatedClients({ clients }: RelatedClientsProps) {
  if (clients.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="عملاء مشابهون" icon={Building2} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {clients.map((client) => {
            const initials = client.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <Link
                key={client.id}
                href={`/clients/${encodeURIComponent(client.slug)}`}
                className="group"
              >
                <div className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-300">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={client.logoMedia?.url || undefined} alt={client.name} />
                    <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                      {client.name}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {client._count.articles} مقال
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
