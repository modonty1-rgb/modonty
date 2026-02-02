import Link from "@/components/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText } from "lucide-react";

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
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          عملاء مشابهون
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                href={`/clients/${client.slug}`}
                className="group"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-300">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={client.logoMedia?.url || undefined} alt={client.name} />
                    <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                      {client.name}
                    </h3>
                    {client.legalName && client.legalName !== client.name && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {client.legalName}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {client._count.articles} مقال
                      </span>
                    </div>
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
