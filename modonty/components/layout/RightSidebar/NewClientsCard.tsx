import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewClientItem } from "./NewClientItem";
import { IconChevronLeft, IconClients } from "@/lib/icons";
import type { SidebarClient } from "@/app/api/helpers/client-queries";

interface NewClientsCardProps {
  clients: SidebarClient[];
}

export function NewClientsCard({ clients }: NewClientsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <IconClients className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase">
              شركاء النجاح
            </h2>
          </div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
          >
            <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
            استكشف
          </Link>
        </div>
        {/* offset = navbar(3.5) + FollowCard(~9) + gap(1) + card-header(2.75) = 16.25 → 17rem */}
        <ScrollArea className="h-[calc(100dvh-19.5rem)]" dir="rtl">
          <div className="pb-4">
          {clients.length > 0 ? (
            clients.map((client) => (
              <NewClientItem
                key={client.id}
                clientName={client.name}
                clientSlug={client.slug}
                clientLogo={client.logo}
                industry={client.industry}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground">لا يوجد شركاء حالياً</p>
          )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
