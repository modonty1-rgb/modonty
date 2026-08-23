import { PartnerAvatar } from "@modonty/shared/components/partner-avatar/PartnerAvatar";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";

interface RelatedClient {
  id: string;
  name: string;
  slug: string;
  legalName?: string | null;
  logoMedia?: { url: string; bunnyUrl: string | null; blurDataURL: string | null } | null;
  _count: {
    articles: number;
  };
}

interface RelatedClientsProps {
  clients: RelatedClient[];
  clientId?: string;
}

export function RelatedClients({ clients, clientId }: RelatedClientsProps) {
  if (clients.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="شركاء مشابهون" icon={ModontyPartnerMark} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {clients.map((client) => {
            const href = `/clients/${encodeURIComponent(client.slug)}`;

            return (
              <CtaTrackedLink
                key={client.id}
                href={href}
                label="Visit client from related"
                type="LINK"
                clientId={clientId}
                className="group"
              >
                <div className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-300">
                  <PartnerAvatar media={client.logoMedia} name={client.name} size="small" />
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                      {client.name}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {client._count.articles} مقال
                    </span>
                  </div>
                </div>
              </CtaTrackedLink>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
